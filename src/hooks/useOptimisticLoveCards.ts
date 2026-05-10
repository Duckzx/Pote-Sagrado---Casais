import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, Timestamp, getDoc } from 'firebase/firestore';
import { LoveCard, CardInteraction, AppUser } from '../types';

export function useOptimisticLoveCards(casalId: string, currentUser: AppUser | null) {
  const [cards, setCards] = useState<LoveCard[]>([]);
  const [interactions, setInteractions] = useState<Record<string, CardInteraction>>({});
  const [loading, setLoading] = useState(true);

  // Load initial data without onSnapshot
  useEffect(() => {
    if (!casalId || !currentUser) return;
    
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        // Load cards from a global or per-tenant collection. Let's assume there is a global or seeded love_cards collection.
        // Or if not present, we will use a hardcoded fallback or seed them.
        const cardsSnap = await getDocs(collection(db, `lovecards`));
        const loadedCards: LoveCard[] = [];
        cardsSnap.forEach(snap => {
          loadedCards.push({ id: snap.id, ...snap.data() } as LoveCard);
        });

        // Load interactions for this couple
        const interRaps = await getDocs(collection(db, `casais/${casalId}/cardInteractions`));
        const loadedInteractions: Record<string, CardInteraction> = {};
        interRaps.forEach(snap => {
          loadedInteractions[snap.id] = { ...snap.data() } as CardInteraction;
        });

        if (isMounted) {
          if (loadedCards.length === 0) {
              setCards(defaultCards); // defined later
          } else {
              setCards(loadedCards);
          }
          setInteractions(loadedInteractions);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading love cards:", err);
        if (isMounted) {
            setCards(defaultCards);
            setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => { isMounted = false; };
  }, [casalId, currentUser]);

  const respondToCard = useCallback(async (cardId: string, response: 'answered' | 'skipped') => {
    if (!currentUser || !casalId) return;
    const uid = currentUser.uid;

    // Save previous state for rollback
    const prevInteractions = { ...interactions };
    const existingInteraction = interactions[cardId];
    
    // Determine which partner is which. We can use a simple uid comparison or just array members
    // For simplicity, we just use a generic 'partnerXResponse' logic or save based on user id.
    // Actually, saving using a map of uid->response is safer, but the types requested specific 'partner1Response' & 'partner2Response' fields.
    // We'll store it logically, or just alter the standard slightly based on uid.
    // We will assume partner1 is the current user for local display, but for DB it depends.
    let isPartner1 = existingInteraction ? existingInteraction.coupleId.startsWith(uid) : true;
    
    const newInteraction: CardInteraction = existingInteraction ? {
      ...existingInteraction,
      ...(isPartner1 ? { partner1Response: response } : { partner2Response: response })
    } : {
      cardId,
      coupleId: casalId,
      partner1Response: response,
      partner2Response: null,
      matchTimestamp: null
    };

    // Optimistic UI Update
    setInteractions(prev => ({
      ...prev,
      [cardId]: newInteraction
    }));

    // Firestore Update
    try {
      const docRef = doc(db, `casais/${casalId}/cardInteractions`, cardId);
      // For simplicity and avoiding write-conflicts when 2 people answer simultaneously, 
      // typically we'd use setDoc with merge or updateDoc.
      await setDoc(docRef, newInteraction, { merge: true });
    } catch (err) {
      console.error("Failed to save card interaction:", err);
      // Rollback
      setInteractions(prevInteractions);
    }
  }, [casalId, currentUser, interactions]);

  return {
    cards,
    interactions,
    respondToCard,
    loading
  };
}

const defaultCards: LoveCard[] = [
  { id: '1', category: 'Mapas do Amor', level: 1, questionOrChallenge: 'Qual foi o meu filme ou série favorita no último ano?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '2', category: 'Mapas do Amor', level: 1, questionOrChallenge: 'Cite o nome dos meus dois amigos mais próximos atualmente.', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '3', category: 'Mapas do Amor', level: 1, questionOrChallenge: 'Qual é o maior estresse que estou enfrentando no meu trabalho ou estudos esta semana?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  
  { id: '4', category: 'Modo Sexy & Intimidade', level: 1, questionOrChallenge: '[Verdade] Qual é a sua parte favorita do meu corpo?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '5', category: 'Modo Sexy & Intimidade', level: 2, questionOrChallenge: 'Faça uma massagem de 5 minutos nos meus ombros ou pés agora mesmo.', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  
  { id: '6', category: 'Quem é Mais...?', level: 1, questionOrChallenge: 'Quem é mais provável de gastar dinheiro com coisas inúteis na internet?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '7', category: 'Quem é Mais...?', level: 1, questionOrChallenge: 'Quem é mais dramático(a) quando está gripado(a) ou doente?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  
  { id: '8', category: 'Sonhos e Valores', level: 1, questionOrChallenge: 'O que significa "ter sucesso na vida" para você hoje?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '9', category: 'Sonhos e Valores', level: 2, questionOrChallenge: 'Qual legado ou impacto você quer deixar no mundo ou para a sua família?', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  
  { id: '10', category: 'Top ou Flop?', level: 1, questionOrChallenge: 'Sair para a balada depois dos 30 anos', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '11', category: 'Top ou Flop?', level: 1, questionOrChallenge: 'Dividir as contas do restaurante 50/50 rigorosamente', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
  { id: '12', category: 'Top ou Flop?', level: 1, questionOrChallenge: 'Viajar no estilo mochileiro sem roteiro definido', askedByUserId: 'system', answeredByUserId: null, answer: null, status: 'unlocked' },
];
