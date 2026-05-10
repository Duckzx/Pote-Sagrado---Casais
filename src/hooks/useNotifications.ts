import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../store/useAppStore';

export const useNotifications = () => {
  const casalId = useAppStore(s => s.casalId);
  const user = useAppStore(s => s.user);
  const setHasUnread = useAppStore(s => s.setHasUnreadNotifications);
  const addToast = useAppStore(s => s.addToast);

  useEffect(() => {
    if (!casalId || !user) return;

    const q = query(
      collection(db, 'casais', casalId, 'notifications'),
      where('to', '==', user.uid),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hasUnread = !snapshot.empty;
      setHasUnread(hasUnread);

      // Trigger toasts for NEW notifications
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.type === 'love_card_response') {
            addToast(
              "Carta do Amor!", 
              "Seu parceiro(a) respondeu a um desafio! 💌", 
              "success"
            );
          }
        }
      });
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, [casalId, user, setHasUnread, addToast]);

  const markNotificationsAsRead = async () => {
    if (!casalId || !user) return;
    
    const q = query(
      collection(db, 'casais', casalId, 'notifications'),
      where('to', '==', user.uid),
      where('read', '==', false)
    );

    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
      setHasUnread(false);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  return { markNotificationsAsRead };
};
