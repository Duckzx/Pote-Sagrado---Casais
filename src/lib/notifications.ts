import { getToken } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, messaging } from '../firebase';

// Use the VAPID key from env or fallback
const VAPID_KEY = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY ||
  'BNd0c8KkPz2SjR_QhE6pA9X6-yD9Qz6XoYvN7gN8P_U';

/**
 * Requests notification permission and registers the FCM token.
 * Stores the token in both the user's profile document AND the shared trip_config.
 * Returns `true` if permission was granted and token stored successfully.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!messaging) {
    console.warn('[Notifications] Messaging not supported on this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Notifications] Permission denied by user.');
      return false;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.error('[Notifications] Failed to obtain FCM token.');
      return false;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('[Notifications] No authenticated user.');
      return false;
    }

    // Store token in user profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        notificationsEnabled: true,
        lastTokenUpdate: new Date().toISOString(),
      });
    } else {
      await setDoc(userRef, {
        theme: 'cookbook',
        fcmTokens: [token],
        notificationsEnabled: true,
        lastTokenUpdate: new Date().toISOString(),
      });
    }

    // Also store in trip_config for shared access
    const tripRef = doc(db, 'trip_config', 'main');
    const tripSnap = await getDoc(tripRef);
    if (tripSnap.exists()) {
      const existing: string[] = tripSnap.data().fcmTokens || [];
      if (!existing.includes(token)) {
        await updateDoc(tripRef, {
          fcmTokens: arrayUnion(token),
        });
      }
    }

    console.log('[Notifications] FCM token registered successfully.');
    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error);
    return false;
  }
}

/**
 * Returns the current notification permission state.
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
