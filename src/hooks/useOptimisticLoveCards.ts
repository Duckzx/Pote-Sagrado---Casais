import { useState, useCallback, useRef } from 'react';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CardInteraction, LoveCardCategory, LoveCardsProgress } from '../types';
import { ALL_LOVE_CARDS, getCardsByLevel } from '../data/loveCards';
import { useAppStore } from '../store/useAppStore';

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
 * - One-shot getDocs() on mount (no onSnapshot — intermittent use)
 * - Optimistic UI: state updates instantly, Firestore writes in background
 * - On failure: silent rollback to previous state
 * - Match detection: when both partners respond → reward
 */
export function useOptimisticLoveCards(casalId: string | null) {
  const addToast = useAppStore(s => s.addToast);

  const [state, setState] = useState<LoveCardsState>({
    interactions: {},
    progress: DEFAULT_PROGRESS,
    goldDust: 0,
    isLoading: true,
  });

  // Ref to prevent double-loading
  const hasLoaded = useRef(false);

  /**
   * Load initial data from Firestore (one-shot, no listener).
   */
  const loadInitial = useCallback(async () => {
    if (!casalId || hasLoaded.current) return;
    hasLoaded.current = true;

    try {
      // Load interactions
      const interSnap = await getDocs(
        collection(db, `casais/${casalId}/love_interactions`)
      );
      const interactions: Record<string, CardInteraction[]> = {};
      interSnap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() } as CardInteraction;
        if (!interactions[data.cardId]) interactions[data.cardId] = [];
        interactions[data.cardId].push(data);
      });

      // Load progress
      const progressDoc = await getDoc(
        doc(db, `casais/${casalId}/love_progress`, 'main')
      );
      const progressData = progressDoc.exists()
        ? (progressDoc.data() as { progress: LoveCardsProgress; goldDust: number })
        : { progress: DEFAULT_PROGRESS, goldDust: 0 };

      setState({
        interactions,
        progress: progressData.progress || DEFAULT_PROGRESS,
        goldDust: progressData.goldDust || 0,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to load love cards data:', e);
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [casalId]);

  /**
   * Refresh interactions (manual pull — e.g. when tab becomes active).
   */
  const refreshInteractions = useCallback(async () => {
    if (!casalId) return;
    try {
      const interSnap = await getDocs(
        collection(db, `casais/${casalId}/love_interactions`)
      );
      const interactions: Record<string, CardInteraction[]> = {};
      interSnap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() } as CardInteraction;
        if (!interactions[data.cardId]) interactions[data.cardId] = [];
        interactions[data.cardId].push(data);
      });

      // Also refresh progress
      const progressDoc = await getDoc(
        doc(db, `casais/${casalId}/love_progress`, 'main')
      );
      if (progressDoc.exists()) {
        const data = progressDoc.data() as { progress: LoveCardsProgress; goldDust: number };
        setState(s => ({
          ...s,
          interactions,
          progress: data.progress || s.progress,
          goldDust: data.goldDust ?? s.goldDust,
        }));
      } else {
        setState(s => ({ ...s, interactions }));
      }
    } catch (e) {
      console.error('Failed to refresh interactions:', e);
    }
  }, [casalId]);

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
        const newGold = state.goldDust + GOLD_REWARD;

        setState(s => ({ ...s, goldDust: newGold }));

        await setDoc(
          doc(db, `casais/${casalId}/love_progress`, 'main'),
          { goldDust: newGold, progress: state.progress },
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
  }, [casalId, state, addToast]);

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
