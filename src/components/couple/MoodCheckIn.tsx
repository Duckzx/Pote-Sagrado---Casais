import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { vibrate } from "../../lib/audio";

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  /** Tip shown to the partner */
  tip: string;
  /** Tip for yourself (solo mode) */
  selfTip: string;
}

export const MOODS: MoodOption[] = [
  { id: "radiante", emoji: "✨", label: "Radiante", tip: "Aproveitem a energia boa e planejem algo juntos hoje.", selfTip: "Anote um sonho novo no mural enquanto a energia está alta." },
  { id: "apaixonada", emoji: "🥰", label: "No clima", tip: "Um elogio sincero agora vai fazer o dia valer.", selfTip: "Registre esse momento: uma foto no álbum vale ouro." },
  { id: "tranquila", emoji: "🌿", label: "Em paz", tip: "Um café a dois sem celular combina com hoje.", selfTip: "Dia perfeito para revisar suas metas com calma." },
  { id: "saudade", emoji: "💭", label: "Com saudade", tip: "Mande uma foto ou um áudio só para dizer oi.", selfTip: "Mande uma mensagem para quem você ama. Custa zero." },
  { id: "cansada", emoji: "🌙", label: "Cansaço", tip: "Que tal assumir o jantar ou a louça hoje?", selfTip: "Descanso também é investimento. Pausa sem culpa hoje." },
  { id: "colo", emoji: "🥺", label: "Querendo colo", tip: "Abraço demorado e zero cobranças. Só presença.", selfTip: "Faça algo gentil por você que não custe nada: banho demorado, playlist favorita." },
  { id: "estressada", emoji: "🌧️", label: "Dia difícil", tip: "Escute sem tentar resolver. Pergunte como pode ajudar.", selfTip: "Respire. Evite compras por impulso hoje: amanhã você decide melhor." },
  { id: "fome", emoji: "🍓", label: "Com fome", tip: "Surpreenda com o lanche favorito. Vale ponto extra.", selfTip: "Cozinhar em casa hoje já é uma economia para o pote." },
];

const MOOD_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredMood {
  id: string;
  at: string;
}

function activeMood(member: any): MoodOption | null {
  const mood = member?.mood as StoredMood | undefined;
  if (!mood?.id || !mood.at) return null;
  if (Date.now() - new Date(mood.at).getTime() > MOOD_TTL_MS) return null;
  return MOODS.find((m) => m.id === mood.id) || null;
}

const firstName = (member: any) =>
  (member?.displayName || member?.email?.split("@")[0] || "Seu amor").split(" ")[0];

/**
 * Daily mood check-in. Stored on each user's profile, so it syncs to the
 * partner's devices through the couple members listener.
 */
export const MoodCheckIn: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const coupleMembers = useAppStore((s) => s.coupleMembers);
  const addToast = useAppStore((s) => s.addToast);
  const [isPicking, setIsPicking] = useState(false);
  const [optimistic, setOptimistic] = useState<StoredMood | null>(null);

  const me = coupleMembers.find((m) => m.id === user?.uid);
  const partner = coupleMembers.find((m) => m.id !== user?.uid);

  // Local choice until the synced profile catches up (or another device changes it)
  const myMood = useMemo(() => {
    const synced: StoredMood | undefined = me?.mood;
    const useLocal = optimistic && (!synced?.at || optimistic.at > synced.at);
    return activeMood(useLocal ? { mood: optimistic } : me);
  }, [optimistic, me]);
  const partnerMood = activeMood(partner);
  const others = coupleMembers.filter((m) => m.id !== user?.uid);
  const mode = useAppStore((s) => s.mode);

  const chooseMood = async (mood: MoodOption) => {
    if (!user) return;
    const stored = { id: mood.id, at: new Date().toISOString() };
    setOptimistic(stored);
    setIsPicking(false);
    vibrate(20);
    try {
      await setDoc(doc(db, "users", user.uid), { mood: stored }, { merge: true });
    } catch (e) {
      console.error("Could not save mood", e);
      setOptimistic(null);
      addToast("Ops!", "Não foi possível salvar seu humor agora.", "info");
    }
  };

  return (
    <section className="bg-cookbook-bg/80 backdrop-blur-2xl border border-cookbook-border rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-cookbook-text/50">
          {mode === "solo" ? "Como estou hoje" : "Como estamos hoje"}
        </h3>
        <span className="text-[10px] font-sans text-cookbook-text/30">atualiza a cada 24h</span>
      </div>

      {mode === "grupo" ? (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
          <button
            onClick={() => setIsPicking((v) => !v)}
            className="shrink-0 w-24 rounded-2xl p-3 text-center bg-cookbook-primary/[0.06] border border-cookbook-primary/20 active:scale-95"
          >
            <span className="block text-2xl">{myMood ? myMood.emoji : "➕"}</span>
            <span className="block font-sans text-[10px] font-bold text-cookbook-text/70 mt-1 truncate">Você</span>
            <span className="block font-serif text-sm text-cookbook-text leading-tight truncate">{myMood ? myMood.label : "Contar"}</span>
          </button>
          {others.map((m) => {
            const mood = activeMood(m);
            return (
              <div key={m.id} className="shrink-0 w-24 rounded-2xl p-3 text-center bg-cookbook-gold/[0.07] border border-cookbook-gold/20">
                <span className="block text-2xl">{mood ? mood.emoji : "💤"}</span>
                <span className="block font-sans text-[10px] font-bold text-cookbook-text/70 mt-1 truncate">{firstName(m)}</span>
                <span className="block font-serif text-sm text-cookbook-text/70 leading-tight truncate">{mood ? mood.label : "—"}</span>
              </div>
            );
          })}
          {others.length === 0 && (
            <p className="self-center font-serif italic text-cookbook-text/40 text-sm px-2">Convide a turma em Ajustes</p>
          )}
        </div>
      ) : (
        <div className={mode === "solo" ? "" : "grid grid-cols-2 gap-3"}>
          {/* Me */}
          <button
            onClick={() => setIsPicking((v) => !v)}
            className="w-full text-left rounded-2xl p-4 bg-cookbook-primary/[0.06] border border-cookbook-primary/15 hover:border-cookbook-primary/40 transition-all active:scale-[0.98]"
          >
            <p className="font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/40 mb-2">Você</p>
            {myMood ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{myMood.emoji}</span>
                <span className="font-serif text-lg text-cookbook-text leading-tight">{myMood.label}</span>
              </div>
            ) : (
              <p className="font-serif italic text-cookbook-primary text-base leading-tight">Toque para contar ✨</p>
            )}
          </button>

          {/* Partner */}
          {mode === "casal" && (
            <div className="rounded-2xl p-4 bg-cookbook-gold/[0.07] border border-cookbook-gold/20">
              <p className="font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/40 mb-2 truncate">
                {partner ? firstName(partner) : "Seu par"}
              </p>
              {partnerMood ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{partnerMood.emoji}</span>
                  <span className="font-serif text-lg text-cookbook-text leading-tight">{partnerMood.label}</span>
                </div>
              ) : (
                <p className="font-serif italic text-cookbook-text/40 text-base leading-tight">
                  {partner ? "Ainda não contou" : "Convide nas configurações"}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "casal" && partnerMood && (
        <p className="mt-3 font-sans text-xs text-cookbook-text/60 leading-relaxed">
          <span className="font-bold text-cookbook-primary">Dica:</span> {partnerMood.tip}
        </p>
      )}
      {mode === "solo" && myMood && (
        <p className="mt-3 font-sans text-xs text-cookbook-text/60 leading-relaxed">
          <span className="font-bold text-cookbook-primary">Para você:</span> {myMood.selfTip}
        </p>
      )}

      <AnimatePresence>
        {isPicking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2 pt-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => chooseMood(mood)}
                  className={`flex flex-col items-center gap-1 rounded-2xl py-3 px-1 border transition-all active:scale-95 ${
                    myMood?.id === mood.id
                      ? "bg-cookbook-primary text-white border-cookbook-primary"
                      : "bg-cookbook-bg border-cookbook-border hover:border-cookbook-primary/40"
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="font-sans text-[9px] font-bold leading-tight text-center">{mood.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
