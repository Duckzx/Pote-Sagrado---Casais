import { useState, useCallback, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, onSnapshot, Timestamp, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CardInteraction, LoveCardCategory, LoveCardsProgress } from '../types';
import { ALL_LOVE_CARDS, getCardsByLevel } from '../data/loveCards';
import { useAppStore } from '../store/useAppStore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const DEFAULT_PROGRESS: LoveCardsProgress = {
  love_romance: 1,
  mutual_knowledge: 1,
  spicy: 1,
  truth_or_dare: 1,
};

interface LoveCardsState {
  interactions: Record<string, CardInteraction[]>;
  progress: LoveCardsProgress;
  goldDust: number;
  isLoading: boolean;
}

/**
 * Custom hook for optimistic Love Cards state management.
 * 
 * Architecture:
 * - Real-time onSnapshot listeners (sync between the partners' devices)
 * - Optimistic UI: state updates instantly, Firestore writes in background
 * - On failure: silent rollback to previous state
 * - Match detection: when both partners respond → reward
 */
export function useOptimisticLoveCards(casalId: string | null) {
  const addToast = useAppStore(s => s.addToast);
  const coupleMembers = useAppStore(s => s.coupleMembers);

  const [state, setState] = useState<LoveCardsState>({
    interactions: {},
    progress: DEFAULT_PROGRESS,
    goldDust: 0,
    isLoading: true,
  });

  /**
   * Real-time listeners: both partners see answers, matches and unlocked
   * levels immediately, on every device.
   */
  useEffect(() => {
    if (!casalId) return;
    setState(s => ({ ...s, isLoading: true }));

    const unsubInteractions = onSnapshot(
      collection(db, `casais/${casalId}/love_interactions`),
      (interSnap) => {
        const interactions: Record<string, CardInteraction[]> = {};
        interSnap.docs.forEach(d => {
          const data = { id: d.id, ...d.data() } as CardInteraction;
          if (!interactions[data.cardId]) interactions[data.cardId] = [];
          interactions[data.cardId].push(data);
        });
        setState(s => ({ ...s, interactions, isLoading: false }));
      },
      (e) => {
        handleFirestoreError(e, OperationType.LIST, `casais/${casalId}/love_interactions`);
        setState(s => ({ ...s, isLoading: false }));
      }
    );

    const unsubProgress = onSnapshot(
      doc(db, `casais/${casalId}/love_progress`, 'main'),
      (progressDoc) => {
        if (!progressDoc.exists()) return;
        const data = progressDoc.data() as { progress?: LoveCardsProgress; goldDust?: number };
        setState(s => ({
          ...s,
          progress: { ...DEFAULT_PROGRESS, ...(data.progress || {}) },
          goldDust: data.goldDust ?? s.goldDust,
        }));
      },
      (e) => handleFirestoreError(e, OperationType.GET, `casais/${casalId}/love_progress/main`)
    );

    return () => {
      unsubInteractions();
      unsubProgress();
    };
  }, [casalId]);

  // Kept for API compatibility: data now arrives through the listeners above.
  const loadInitial = useCallback(async () => {}, []);
  const refreshInteractions = useCallback(async () => {}, []);

  /**
   * Respond to a card — optimistic update with rollback on failure.
   */
  const respondToCard = useCallback(async (cardId: string, answer?: string) => {
    if (!casalId) return;
    const user = auth.currentUser;
    if (!user) return;

    // Check if already responded
    const existing = state.interactions[cardId] || [];
    if (existing.some(i => i.partnerId === user.uid)) return;

    // Build new interaction
    const newInteraction: CardInteraction = {
      cardId,
      partnerId: user.uid,
      partnerName: user.displayName || 'Parceiro',
      hasResponded: true,
      answer,
      respondedAt: Timestamp.now(),
    };

    // --- OPTIMISTIC UPDATE ---
    const previousState = { ...state };

    setState(s => ({
      ...s,
      interactions: {
        ...s.interactions,
        [cardId]: [...(s.interactions[cardId] || []), newInteraction],
      },
    }));

    try {
      // Create a notification for the partner
      const partner = coupleMembers.find(m => (m.uid || m.id) !== user.uid);
      const partnerId = partner ? (partner.uid || partner.id) : undefined;
      if (partnerId) {
        await addDoc(collection(db, 'casais', casalId, 'notifications'), {
          type: 'love_card_response',
          cardId,
          from: auth.currentUser?.uid,
          to: partnerId,
          timestamp: serverTimestamp(),
          read: false
        });
      }

      // Write to Firestore
      await addDoc(
        collection(db, `casais/${casalId}/love_interactions`),
        {
          cardId: newInteraction.cardId,
          partnerId: newInteraction.partnerId,
          partnerName: newInteraction.partnerName,
          hasResponded: newInteraction.hasResponded,
          answer: newInteraction.answer || null,
          respondedAt: newInteraction.respondedAt,
        }
      );

      // Check for MATCH (both partners responded)
      const allForCard = [...existing, newInteraction];
      const uniquePartners = new Set(allForCard.map(i => i.partnerId));

      if (uniquePartners.size >= 2) {
        // 🎉 MATCH! Award gold dust
        const GOLD_REWARD = 10;
        setState(s => ({ ...s, goldDust: s.goldDust + GOLD_REWARD }));

        await setDoc(
          doc(db, `casais/${casalId}/love_progress`, 'main'),
          { goldDust: increment(GOLD_REWARD), progress: state.progress },
          { merge: true }
        );

        addToast(
          'Match! 💫',
          `Ambos responderam! +${GOLD_REWARD} Pó de Ouro adicionado ao Pote.`,
          'milestone'
        );
      } else {
        addToast(
          'Carta Respondida! ✨',
          'Agora é a vez do seu parceiro(a).',
          'success'
        );
      }

      // Check level progression for this card's category
      const card = ALL_LOVE_CARDS.find(c => c.id === cardId);
      if (card) {
        await checkAndUnlockLevel(card.category, {
          ...state.interactions,
          [cardId]: [...(state.interactions[cardId] || []), newInteraction],
        });
      }
    } catch (e) {
      // --- ROLLBACK ---
      console.error('Optimistic update failed, rolling back:', e);
      setState(previousState);
    }
  }, [casalId, state, addToast, coupleMembers]);

  /**
   * Check if all cards in the current level have been completed (both partners)
   * and unlock the next level if so.
   */
  const checkAndUnlockLevel = useCallback(async (
    category: LoveCardCategory,
    currentInteractions: Record<string, CardInteraction[]>
  ) => {
    if (!casalId) return;

    const currentLevel = state.progress[category] || 1;
    if (currentLevel >= 5) return; // Max level

    const cardsInLevel = getCardsByLevel(category, currentLevel);
    
    // Check if every card in this level has responses from at least 2 unique partners
    const allCompleted = cardsInLevel.every(card => {
      const interactions = currentInteractions[card.id] || [];
      const uniquePartners = new Set(interactions.map(i => i.partnerId));
      return uniquePartners.size >= 2;
    });

    if (allCompleted) {
      const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4 | 5;
      const newProgress = { ...state.progress, [category]: nextLevel };

      // Optimistic
      setState(s => ({ ...s, progress: newProgress }));

      try {
        await setDoc(
          doc(db, `casais/${casalId}/love_progress`, 'main'),
          { progress: newProgress },
          { merge: true }
        );

        addToast(
          'Nível Desbloqueado! 🔓',
          `Categoria "${category.replace('_', ' ')}" avançou para o Nível ${nextLevel}!`,
          'milestone'
        );
      } catch (e) {
        console.error('Failed to unlock level:', e);
        // Rollback
        setState(s => ({ ...s, progress: state.progress }));
      }
    }
  }, [casalId, state.progress, addToast]);

  /**
   * Check if the current user has already responded to a card.
   */
  const hasUserResponded = useCallback((cardId: string): boolean => {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    return (state.interactions[cardId] || []).some(i => i.partnerId === uid);
  }, [state.interactions]);

  /**
   * Check if a card has a match (both partners responded).
   */
  const isMatch = useCallback((cardId: string): boolean => {
    const interactions = state.interactions[cardId] || [];
    const uniquePartners = new Set(interactions.map(i => i.partnerId));
    return uniquePartners.size >= 2;
  }, [state.interactions]);

  /**
   * Count completed cards for a category at a given level.
   */
  const getCompletionCount = useCallback((category: LoveCardCategory, level: number): { done: number; total: number } => {
    const cards = getCardsByLevel(category, level);
    const uid = auth.currentUser?.uid;
    const done = cards.filter(c => {
      const interactions = state.interactions[c.id] || [];
      return interactions.some(i => i.partnerId === uid);
    }).length;
    return { done, total: cards.length };
  }, [state.interactions]);

  return {
    ...state,
    loadInitial,
    refreshInteractions,
    respondToCard,
    hasUserResponded,
    isMatch,
    getCompletionCount,
  };
}
