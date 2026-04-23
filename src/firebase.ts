import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

import { getMessaging, isSupported } from 'firebase/messaging';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

export let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

/**
 * Attempts Google login via popup first.
 * If popup is blocked (common on mobile PWAs / in-app browsers),
 * falls back to redirect-based sign-in automatically.
 */
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    // Popup blocked or closed — fallback to redirect
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/internal-error'
    ) {
      console.warn('Popup blocked, falling back to redirect login...');
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error('Error signing in with redirect:', redirectError);
      }
    } else {
      console.error("Error signing in with Google:", error);
    }
  }
};

/**
 * Handles the redirect result when the page loads after a redirect sign-in.
 * Should be called once on app initialization.
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Redirect sign-in successful');
    }
  } catch (error) {
    console.error('Error handling redirect result:', error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
