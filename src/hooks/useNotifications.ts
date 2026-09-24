import { useCallback, useEffect } from 'react';
import { collection, query, where, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppStore } from '../store/useAppStore';

/**
 * Real-time partner notifications.
 *
 * Pass `listen: false` when a component only needs `markNotificationsAsRead`,
 * so there is a single listener (in App) and toasts aren't duplicated.
 * The queries use equality filters only, so they don't need a composite index.
 */
export const useNotifications = ({ listen = true }: { listen?: boolean } = {}) => {
  const casalId = useAppStore(s => s.casalId);
  const user = useAppStore(s => s.user);
  const setHasUnread = useAppStore(s => s.setHasUnreadNotifications);
  const addToast = useAppStore(s => s.addToast);
  const uid = user?.uid;

  useEffect(() => {
    if (!listen || !casalId || !uid) return;

    const q = query(
      collection(db, 'casais', casalId, 'notifications'),
      where('to', '==', uid),
      where('read', '==', false),
    );

    let isInitialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasUnread(!snapshot.empty);

      // Toast only for notifications that arrive while the app is open
      if (!isInitialLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().type === 'love_card_response') {
            addToast(
              "Carta do Amor!",
              "Seu parceiro(a) respondeu a um desafio! 💌",
              "success"
            );
          }
        });
      }
      isInitialLoad = false;
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, [listen, casalId, uid, setHasUnread, addToast]);

  const markNotificationsAsRead = useCallback(async () => {
    if (!casalId || !uid) return;

    const q = query(
      collection(db, 'casais', casalId, 'notifications'),
      where('to', '==', uid),
      where('read', '==', false)
    );

    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
      setHasUnread(false);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }, [casalId, uid, setHasUnread]);

  return { markNotificationsAsRead };
};
