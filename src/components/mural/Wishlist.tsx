import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, Trash2 } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { Wish } from "../../types";
import { maskCurrency, parseCurrencyString } from "../../lib/maskUtils";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { vibrate } from "../../lib/audio";

const EMOJIS = ["🎀", "👗", "👟", "💄", "📱", "🎧", "✈️", "🏖️", "🍣", "🎁", "🪴", "💍"];
const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const EMPTY: Wish[] = [];

/**
 * Lista de desejos: things the pot can buy. Shows how close the current
 * balance is to each item. Stored on the shared goal doc (real-time).
 */
export const Wishlist: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const wishes = useAppStore((s) => s.tripConfig?.wishes) || EMPTY;
  const totalSaved = useAppStore((s) => s.totalSaved);
  const setTripConfig = useAppStore((s) => s.setTripConfig);
  const addToast = useAppStore((s) => s.addToast);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const sorted = useMemo(
    () => [...wishes].sort((a, b) => Number(a.bought) - Number(b.bought) || a.price - b.price),
    [wishes],
  );

  const save = async (next: Wish[]) => {
    if (!casalId) return;
    setTripConfig((prev) => (prev ? { ...prev, wishes: next } : prev));
    try {
      await setDoc(doc(db, `casais/${casalId}/trip_config`, "main"), { wishes: next }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `casais/${casalId}/trip_config`);
    }
  };

  const add = async () => {
    const value = parseCurrencyString(price);
    if (!name.trim() || !(value > 0)) return;
    const wish: Wish = {
      id: `w_${Date.now()}`,
      name: name.trim().slice(0, 60),
      price: value,
      emoji,
      bought: false,
      addedBy: auth.currentUser?.uid || "",
    };
    await save([...wishes, wish].slice(-60));
    vibrate(15);
    setName("");
    setPrice("");
    setAdding(false);
  };

  const toggleBought = (w: Wish) => {
    save(wishes.map((x) => (x.id === w.id ? { ...x, bought: !x.bought } : x)));
    if (!w.bought) {
      vibrate([20, 40, 20]);
      addToast("Realizado! 🎉", `${w.emoji} ${w.name} saiu da lista de desejos.`, "success");
    }
  };

  const remove = (w: Wish) => save(wishes.filter((x) => x.id !== w.id));

  return (
    <section className="w-full max-w-md mx-auto rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl text-cookbook-text leading-tight">Lista de desejos 🎀</h3>
          <p className="font-sans text-xs text-cookbook-text/70 mt-1">O que o pote já consegue comprar.</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="w-9 h-9 shrink-0 rounded-full bg-cookbook-primary/10 text-cookbook-primary flex items-center justify-center"
          aria-label="Adicionar desejo"
        >
          <Plus size={16} className={adding ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`shrink-0 w-9 h-9 rounded-xl text-lg ${emoji === e ? "bg-cookbook-primary/20 ring-2 ring-cookbook-primary" : "bg-cookbook-text/5"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tênis novo, jantar japonês..."
                maxLength={60}
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary"
              />
              <div className="flex gap-2">
                <input
                  value={price}
                  onChange={(e) => setPrice(maskCurrency(e.target.value))}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className="flex-1 min-w-0 bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary"
                />
                <button
                  onClick={add}
                  disabled={!name.trim() || !(parseCurrencyString(price) > 0)}
                  className="px-5 rounded-2xl bg-cookbook-primary text-cookbook-on-primary font-sans text-[11px] uppercase tracking-widest font-bold disabled:opacity-40"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 && !adding && (
        <p className="font-serif italic text-cookbook-text/70 text-center py-6">Adicione o primeiro desejo ✨</p>
      )}

      <ul className="mt-4 space-y-2">
        {sorted.map((w) => {
          const pct = Math.min(100, Math.max(0, (totalSaved / w.price) * 100));
          const affordable = !w.bought && totalSaved >= w.price;
          return (
            <li
              key={w.id}
              className={`rounded-2xl p-3 border ${
                w.bought ? "border-cookbook-border/50 opacity-60" : affordable ? "border-emerald-400/50 bg-emerald-500/5" : "border-cookbook-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-sans text-sm font-bold text-cookbook-text truncate ${w.bought ? "line-through" : ""}`}>{w.name}</p>
                  <p data-money className="font-sans text-[11px] text-cookbook-text/70">
                    {brl(w.price)}
                    {!w.bought && (affordable ? " · já dá para comprar! 🎉" : ` · ${Math.floor(pct)}%`)}
                  </p>
                </div>
                <button
                  onClick={() => toggleBought(w)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    w.bought ? "bg-emerald-500 border-emerald-500 text-white" : "border-cookbook-border text-cookbook-text/70"
                  }`}
                  aria-label={w.bought ? "Desmarcar comprado" : "Marcar como comprado"}
                >
                  <Check size={14} />
                </button>
                <button onClick={() => remove(w)} className="p-1.5 text-cookbook-text/70" aria-label="Remover desejo">
                  <Trash2 size={14} />
                </button>
              </div>
              {!w.bought && (
                <div className="h-1.5 rounded-full bg-cookbook-border/50 overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-cookbook-primary to-cookbook-gold" style={{ width: `${Math.max(3, pct)}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
