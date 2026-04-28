import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual VAPID key from Firebase Console
// Project Settings > Cloud Messaging > Web configuration > Web Push certificates
const VAPID_KEY = "BEtSr1urWC2nzx3esnYP0M01r0Rc56z5Ti17-eCQNlHa5acWcLKahBVgPr_s6-_qP7S519h0iy_zA5uvtOaB1vs";

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) {
    console.warn("Messaging not supported or initialized.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log("FCM Token:", token);
        // Save token to user document
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          notificationsEnabled: true,
          lastTokenUpdate: new Date().toISOString()
        });
        return token;
      }
    } else {
      console.warn("Permission not granted for notifications.");
    }
  } catch (error) {
    console.error("Error setting up notifications:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      resolve(payload);
    });
  });
