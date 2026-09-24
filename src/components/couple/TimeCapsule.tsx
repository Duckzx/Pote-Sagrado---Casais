import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, MailOpen, PenLine, Trash2, X } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { openPremiumModal } from "../../lib/premium";
import { playSuccessSound, vibrate } from "../../lib/audio";

interface Capsule {
  id: string;
  from: string;
  fromName: string;
  message: string;
  openAt: Timestamp;
  openedAt?: Timestamp | null;
}

const FREE_SEALED_LIMIT = 2;
const MAX_MESSAGE = 2000;
const DAY_MS = 24 * 60 * 60 * 1000;

const PRESETS = [
  { label: "1 semana", days: 7 },
  { label: "1 mês", days: 30 },
  { label: "6 meses", days: 182 },
  { label: "1 ano", days: 365 },
];

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function timeLeft(openAt: Date) {
  const days = Math.ceil((openAt.getTime() - Date.now()) / DAY_MS);
  if (days <= 1) return "abre amanhã";
  if (days < 60) return `abre em ${days} dias`;
  const months = Math.round(days / 30);
  return `abre em ${months} meses`;
}

/**
 * Letters sealed until a chosen date. Synced in real time: the partner sees
 * the sealed envelope right away and can open it on the day.
 */
export const TimeCapsule: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const user = useAppStore((s) => s.user);
  const isPremium = useAppStore((s) => s.isPremium);
  const addToast = useAppStore((s) => s.addToast);

  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [message, setMessage] = useState("");
  const [openDate, setOpenDate] = useState(() => toInputDate(new Date(Date.now() + 30 * DAY_MS)));
  const [isSaving, setIsSaving] = useState(false);
  const [reading, setReading] = useState<Capsule | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!casalId) return;
    const q = query(collection(db, `casais/${casalId}/capsules`), orderBy("openAt", "asc"));
    return onSnapshot(
      q,
      (snap) => setCapsules(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Capsule))),
      (e) => console.error("Capsules listener error", e),
    );
  }, [casalId]);

  // Re-render every minute so envelopes unlock on time
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  const sealed = useMemo(() => capsules.filter((c) => c.openAt?.toMillis() > now), [capsules, now]);
  const ready = useMemo(() => capsules.filter((c) => c.openAt?.toMillis() <= now), [capsules, now]);

  const startWriting = () => {
    if (!isPremium && sealed.length >= FREE_SEALED_LIMIT) {
      addToast("Cápsula cheia", `No plano grátis são até ${FREE_SEALED_LIMIT} cartas lacradas ao mesmo tempo.`, "info");
      openPremiumModal();
      return;
    }
    setIsWriting(true);
  };

  const seal = async () => {
    if (!casalId || !user || !message.trim()) return;
    const date = new Date(`${openDate}T08:00:00`);
    if (isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      addToast("Data inválida", "Escolha uma data no futuro para abrir a carta.", "info");
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, `casais/${casalId}/capsules`), {
        from: user.uid,
        fromName: user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Seu amor",
        message: message.trim().slice(0, MAX_MESSAGE),
        openAt: Timestamp.fromDate(date),
        openedAt: null,
        createdAt: serverTimestamp(),
      });
      playSuccessSound();
      vibrate([30, 50, 30]);
      addToast("Carta lacrada 💌", `Ela só poderá ser aberta em ${date.toLocaleDateString("pt-BR")}.`, "success");
      setMessage("");
      setIsWriting(false);
    } catch (e) {
      console.error(e);
      addToast("Ops!", "Não foi possível lacrar a carta.", "info");
    } finally {
      setIsSaving(false);
    }
  };

  const open = async (capsule: Capsule) => {
    setReading(capsule);
    vibrate(20);
    if (!capsule.openedAt && casalId) {
      updateDoc(doc(db, `casais/${casalId}/capsules`, capsule.id), { openedAt: serverTimestamp() }).catch(() => {});
    }
  };

  const remove = async (capsule: Capsule) => {
    if (!casalId || !window.confirm("Apagar esta carta?")) return;
    try {
      await deleteDoc(doc(db, `casais/${casalId}/capsules`, capsule.id));
    } catch {
      addToast("Ops!", "Só quem escreveu pode apagar a carta.", "info");
    }
  };

  return (
    <section className="bg-cookbook-bg/80 backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-2xl text-cookbook-text leading-tight">Cápsula do Tempo</h3>
          <p className="font-sans text-xs text-cookbook-text/50 mt-1">
            Cartas lacradas para abrir no futuro.
          </p>
        </div>
        <button
          onClick={startWriting}
          className="shrink-0 flex items-center gap-2 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-full shadow-md active:scale-95 transition-transform"
        >
          <PenLine size={12} /> Escrever
        </button>
      </div>

      {capsules.length === 0 && !isWriting && (
        <p className="font-serif italic text-cookbook-text/40 text-center py-6">
          Escreva algo para o seu par ler daqui a um tempo 💌
        </p>
      )}

      <div className="space-y-2">
        {ready.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl p-3 bg-cookbook-gold/[0.08] border border-cookbook-gold/25">
            <span className="text-2xl">{c.openedAt ? "📖" : "💌"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-cookbook-text truncate">
                {c.from === user?.uid ? "Sua carta" : `Carta de ${c.fromName}`}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                {c.openedAt ? "já aberta" : "pronta para abrir"}
              </p>
            </div>
            <button
              onClick={() => open(c)}
              className="flex items-center gap-1.5 text-cookbook-primary font-sans text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-full bg-cookbook-primary/10 active:scale-95"
            >
              <MailOpen size={12} /> Abrir
            </button>
          </div>
        ))}

        {sealed.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl p-3 bg-cookbook-primary/[0.05] border border-cookbook-border">
            <div className="w-9 h-9 rounded-full bg-cookbook-primary/10 text-cookbook-primary flex items-center justify-center">
              <Lock size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-cookbook-text truncate">
                {c.from === user?.uid ? "Sua carta lacrada" : `${c.fromName} deixou uma carta`}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                {timeLeft(c.openAt.toDate())} · {c.openAt.toDate().toLocaleDateString("pt-BR")}
              </p>
            </div>
            {c.from === user?.uid && (
              <button onClick={() => remove(c)} className="p-2 text-cookbook-text/30 hover:text-red-500" title="Apagar">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                rows={5}
                autoFocus
                placeholder="Meu amor, quando você ler isso..."
                className="w-full bg-cookbook-mural border border-cookbook-border rounded-2xl p-4 font-serif text-lg text-cookbook-text leading-relaxed focus:outline-none focus:border-cookbook-primary resize-none placeholder:text-cookbook-text/25"
              />
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setOpenDate(toInputDate(new Date(Date.now() + p.days * DAY_MS)))}
                    className="font-sans text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-cookbook-border text-cookbook-text/60 hover:border-cookbook-primary/50 hover:text-cookbook-primary"
                  >
                    {p.label}
                  </button>
                ))}
                <input
                  type="date"
                  value={openDate}
                  min={toInputDate(new Date(Date.now() + DAY_MS))}
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="font-sans text-xs bg-transparent border border-cookbook-border rounded-full px-3 py-1 text-cookbook-text"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWriting(false)}
                  className="flex-1 font-sans text-[10px] uppercase tracking-widest font-bold py-3 rounded-full border border-cookbook-border text-cookbook-text/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={seal}
                  disabled={isSaving || !message.trim()}
                  className="flex-[2] font-sans text-[10px] uppercase tracking-widest font-bold py-3 rounded-full bg-cookbook-primary text-white shadow-md disabled:opacity-40"
                >
                  {isSaving ? "Lacrando..." : "Lacrar carta 💌"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setReading(null)}
          >
            <motion.article
              initial={{ scale: 0.9, y: 30, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm max-h-[80vh] overflow-y-auto bg-cookbook-mural rounded-[28px] p-7 shadow-2xl border border-cookbook-gold/30"
            >
              <button onClick={() => setReading(null)} className="absolute top-4 right-4 text-cookbook-text/40">
                <X size={18} />
              </button>
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-cookbook-gold mb-4">
                {reading.from === user?.uid ? "Você escreveu" : `De ${reading.fromName}`}
              </p>
              <p className="font-serif text-xl text-cookbook-text leading-relaxed whitespace-pre-wrap">
                {reading.message}
              </p>
              <p className="font-serif italic text-cookbook-primary text-right mt-6">♥</p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
