import React, { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, Loader2, Copy, RotateCw } from "lucide-react";
import {
  collection,
  doc,
  getDocsFromServer,
  getDocFromServer,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAppStore } from "../store/useAppStore";
import { Portal } from "./ui/portal";

interface Check {
  label: string;
  path: string;
  run: () => Promise<unknown>;
}

interface Result {
  label: string;
  path: string;
  ok: boolean | null;
  detail?: string;
}

declare const __APP_VERSION__: string;

/**
 * Checks, against the live Firestore server, every read/write the app needs
 * for this account and pot. Makes permission problems visible and reportable.
 */
export const Diagnostics: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const casalId = useAppStore((s) => s.casalId);
  const mode = useAppStore((s) => s.mode);
  const syncIssues = useAppStore((s) => s.syncIssues);
  const clearSyncIssues = useAppStore((s) => s.clearSyncIssues);
  const addToast = useAppStore((s) => s.addToast);
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [profileCasalId, setProfileCasalId] = useState<string | null>(null);

  const run = useCallback(async () => {
    const user = auth.currentUser;
    if (!user || !casalId) return;
    setRunning(true);
    const base = `casais/${casalId}`;
    const checks: Check[] = [
      {
        label: "Ler meu perfil",
        path: `users/${user.uid}`,
        run: async () => {
          const snap = await getDocFromServer(doc(db, "users", user.uid));
          setProfileCasalId(snap.exists() ? snap.data().casalId || null : null);
        },
      },
      { label: "Ler o pote", path: base, run: () => getDocFromServer(doc(db, base)) },
      { label: "Ler a meta", path: `${base}/trip_config/main`, run: () => getDocFromServer(doc(db, `${base}/trip_config/main`)) },
      { label: "Ver membros", path: "users?casalId", run: () => getDocsFromServer(query(collection(db, "users"), where("casalId", "==", casalId))) },
      { label: "Depósitos", path: `${base}/deposits`, run: () => getDocsFromServer(query(collection(db, `${base}/deposits`), limit(1))) },
      { label: "Conquistas", path: `${base}/achievements`, run: () => getDocsFromServer(query(collection(db, `${base}/achievements`), limit(1))) },
      { label: "Mural", path: `${base}/pinboard_links`, run: () => getDocsFromServer(query(collection(db, `${base}/pinboard_links`), limit(1))) },
      { label: "Álbum", path: `${base}/gallery`, run: () => getDocsFromServer(query(collection(db, `${base}/gallery`), limit(1))) },
      { label: "Cápsula do Tempo", path: `${base}/capsules`, run: () => getDocsFromServer(query(collection(db, `${base}/capsules`), limit(1))) },
      { label: "Cartas", path: `${base}/love_interactions`, run: () => getDocsFromServer(query(collection(db, `${base}/love_interactions`), limit(1))) },
      {
        label: "Notificações",
        path: `${base}/notifications`,
        run: () => getDocsFromServer(query(collection(db, `${base}/notifications`), where("to", "==", user.uid), where("read", "==", false))),
      },
      {
        label: "Salvar no perfil",
        path: `users/${user.uid}`,
        run: () => setDoc(doc(db, "users", user.uid), { lastSeenAt: new Date().toISOString() }, { merge: true }),
      },
      {
        label: "Salvar no pote",
        path: base,
        run: () => setDoc(doc(db, base), { lastActiveAt: new Date().toISOString() }, { merge: true }),
      },
      {
        label: "Salvar na meta",
        path: `${base}/trip_config/main`,
        run: () => setDoc(doc(db, `${base}/trip_config/main`), { lastCheckedAt: new Date().toISOString() }, { merge: true }),
      },
    ];

    setResults(checks.map((c) => ({ label: c.label, path: c.path, ok: null })));
    for (let i = 0; i < checks.length; i++) {
      let res: Result;
      try {
        await Promise.race([
          checks[i].run(),
          new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), 12000)),
        ]);
        res = { label: checks[i].label, path: checks[i].path, ok: true };
      } catch (e: any) {
        res = { label: checks[i].label, path: checks[i].path, ok: false, detail: e?.code || e?.message || "erro" };
      }
      setResults((prev) => prev.map((r, j) => (j === i ? res : r)));
    }
    setRunning(false);
  }, [casalId]);

  useEffect(() => {
    run();
  }, [run]);

  const failed = results.filter((r) => r.ok === false);
  const report = [
    `Pote Sagrado — diagnóstico`,
    `versão: ${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"}`,
    `usuário: ${auth.currentUser?.uid} (${auth.currentUser?.providerData.map((p) => p.providerId).join(",")})`,
    `pote no app: ${casalId} · no perfil: ${profileCasalId ?? "(vazio)"} · modo: ${mode}`,
    ...results.map((r) => `${r.ok ? "OK " : r.ok === false ? "ERRO" : "..."} ${r.label} [${r.path}] ${r.detail || ""}`),
    ...syncIssues.map((i) => `sync: ${i.path} ${i.code}`),
  ].join("\n");

  const mismatch = profileCasalId !== null && casalId !== null && profileCasalId !== casalId;

  return (
    <Portal>
    <div className="fixed inset-0 z-[230] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-cookbook-bg rounded-t-[28px] sm:rounded-[28px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-2xl text-cookbook-text">Diagnóstico</h3>
          <button onClick={onClose} className="p-2 text-cookbook-text/50" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <p className="font-sans text-xs text-cookbook-text/60 mb-4">
          {running
            ? "Testando o acesso a cada parte do app…"
            : failed.length === 0
              ? "Tudo certo: sua conta acessa todas as funções. ✨"
              : `${failed.length} parte(s) bloqueada(s). Copie o relatório e envie para o suporte.`}
        </p>

        {mismatch && (
          <p className="font-sans text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
            O pote aberto no app é diferente do pote salvo no seu perfil. Feche e abra o app de novo.
          </p>
        )}

        <ul className="space-y-1.5">
          {results.map((r) => (
            <li key={r.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-cookbook-text/[0.03]">
              {r.ok === null ? (
                <Loader2 size={16} className="animate-spin text-cookbook-text/40" />
              ) : r.ok ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <span className="flex-1 font-sans text-sm text-cookbook-text">{r.label}</span>
              {r.detail && <span className="font-mono text-[10px] text-red-500">{r.detail}</span>}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => {
              clearSyncIssues();
              run();
            }}
            disabled={running}
            className="flex items-center justify-center gap-2 py-3 rounded-full border border-cookbook-border font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text disabled:opacity-40"
          >
            <RotateCw size={14} /> Testar de novo
          </button>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(report).catch(() => {});
              addToast("Relatório copiado", "Cole na conversa com o suporte.", "success");
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold"
          >
            <Copy size={14} /> Copiar relatório
          </button>
        </div>
        <p className="font-mono text-[9px] text-cookbook-text/30 text-center mt-3 break-all">
          {typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"} · {casalId}
        </p>
      </div>
    </div>
    </Portal>
  );
};

/** Discreet banner when background data couldn't sync. */
export const SyncIssueBanner: React.FC = () => {
  const syncIssues = useAppStore((s) => s.syncIssues);
  const [open, setOpen] = useState(false);
  const recent = syncIssues.filter((i) => i.code !== "unavailable");
  if (recent.length === 0 && !open) return null;
  return (
    <>
      {recent.length > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-2 rounded-full bg-cookbook-text text-cookbook-bg shadow-lg font-sans text-[11px] font-bold"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Alguns dados não sincronizaram · Ver detalhes
        </button>
      )}
      {open && <Diagnostics onClose={() => setOpen(false)} />}
    </>
  );
};
