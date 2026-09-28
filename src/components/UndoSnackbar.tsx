import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAppStore } from "../store/useAppStore";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

const DURATION = 6000;

/** "Depósito salvo · Desfazer" for a few seconds after creating a record. */
export const UndoSnackbar: React.FC = () => {
  const undo = useAppStore((s) => s.undo);
  const clearUndo = useAppStore((s) => s.clearUndo);
  const addToast = useAppStore((s) => s.addToast);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(clearUndo, DURATION);
    return () => clearTimeout(t);
  }, [undo, clearUndo]);

  const revert = async () => {
    if (!undo) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, undo.path));
      addToast("Desfeito", "O registro foi removido do pote.", "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, undo.path);
    } finally {
      setBusy(false);
      clearUndo();
    }
  };

  return (
    <AnimatePresence>
      {undo && (
        <motion.div
          key={undo.id}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          role="status" aria-live="polite" className="fixed left-1/2 -translate-x-1/2 z-[130] bottom-[calc(6.5rem+env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative overflow-hidden flex items-center gap-3 rounded-2xl bg-cookbook-text text-cookbook-bg px-4 py-3 shadow-2xl">
            <span className="flex-1 font-sans text-sm truncate">{undo.label}</span>
            <button
              onClick={revert}
              disabled={busy}
              className="font-sans text-xs uppercase tracking-widest font-bold text-cookbook-gold disabled:opacity-50"
            >
              Desfazer
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-cookbook-gold"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: DURATION / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
