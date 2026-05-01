import { useState, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Deposit } from '../types';

export function useFinances() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDeposit = useCallback(async (amount: number, type: 'income' | 'expense', description: string, imageBase64?: string | null) => {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    setIsSubmitting(true);
    try {
      const data: any = {
        amount,
        type,
        action: description || (type === "income" ? "Depósito rápido" : "Gasto rápido"),
        who: auth.currentUser.uid,
        whoName: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Alguém",
        createdAt: serverTimestamp(),
      };
      if (imageBase64) data.imageUrl = imageBase64;
      
      await addDoc(collection(db, "deposits"), data);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const editDeposit = useCallback(async (depositId: string, newAmount: number, newDesc: string) => {
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "deposits", depositId), { amount: newAmount, action: newDesc }, { merge: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deposits/${depositId}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const removeDeposit = useCallback(async (depositId: string) => {
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "deposits", depositId));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deposits/${depositId}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Nota de Arquiteto: Para Otimização futura do Total, faríamos um Firebase Cloud Function
  // ou uma transação atómica que atualiza o TripConfig sempre que chamamos estas rotinas.

  return { addDeposit, editDeposit, removeDeposit, isFinanceSubmitting: isSubmitting };
}
