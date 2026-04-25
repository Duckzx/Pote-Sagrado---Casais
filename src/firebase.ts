import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
    console.warn('Popup login failed.', error.code, error.message);
    
    if (error?.code === 'auth/unauthorized-domain') {
      throw error;
    }
    
    if (error?.code === 'auth/popup-blocked' || 
        error?.code === 'auth/popup-closed-by-user' ||
        error.message?.toLowerCase().includes('popup')) {
      throw new Error('O login por pop-up foi bloqueado ou fechado. Se você estiver usando o navegador do Instagram, WhatsApp ou Safari, tente abrir o link em um navegador como Chrome ou Safari diretamente, ou desative o bloqueador de pop-ups.');
    }

    throw new Error('Erro ao tentar login com Google: ' + (error.message || 'Erro desconhecido'));
  }
};


export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
