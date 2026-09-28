import React from "react";
import { Copy, UserPlus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

/**
 * Couple/group pots with a single member: invite the partner or the friends
 * (WhatsApp link with the invite code, or copy the code).
 */
export const InviteNudge: React.FC = () => {
  const mode = useAppStore((s) => s.mode);
  const user = useAppStore((s) => s.user);
  const coupleMembers = useAppStore((s) => s.coupleMembers);
  const groupName = useAppStore((s) => s.groupName);
  const addToast = useAppStore((s) => s.addToast);

  if (mode === "solo" || coupleMembers.length > 1) return null;
  const me = coupleMembers.find((m) => m.id === user?.uid);
  const code: string | undefined = me?.inviteCode;
  if (!code) return null;

  const link = `${window.location.origin}/?invite=${code}`;
  const text =
    mode === "grupo"
      ? `Entra no nosso pote${groupName ? ` "${groupName}"` : ""} no Pote Sagrado pra gente juntar junto 🫶 ${link}`
      : `Vem guardar dinheiro comigo pro nosso sonho no Pote Sagrado 💞 ${link}`;

  return (
    <section className="rounded-3xl p-5 border border-dashed border-cookbook-primary/40 bg-cookbook-bg/85 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-cookbook-primary/10 text-cookbook-primary flex items-center justify-center shrink-0">
          <UserPlus size={18} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-xl text-cookbook-text leading-tight">
            {mode === "grupo" ? "Chame a turma" : "Falta o seu par"}
          </p>
          <p className="font-sans text-[11px] text-cookbook-text/70">
            Quem entrar pelo link vê e guarda no mesmo pote, em tempo real.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 rounded-full bg-[#25D366] text-white font-sans text-[11px] uppercase tracking-widest font-bold"
        >
          Convidar pelo WhatsApp
        </a>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(link).catch(() => {});
            addToast("Link copiado", `Código ${code} · cole onde quiser.`, "success");
          }}
          className="flex items-center gap-1.5 px-4 rounded-full border border-cookbook-border font-mono text-xs font-bold text-cookbook-primary"
          aria-label="Copiar link de convite"
        >
          <Copy size={13} /> {code}
        </button>
      </div>
    </section>
  );
};
