import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  connectFirestoreEmulator,
  Firestore,
  doc,
  setDoc,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

// Optional: serve the auth handler from the app's own domain (see README).
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain;

const app = initializeApp({ ...firebaseConfig, authDomain });
export const auth = getAuth(app);

// Offline cache shared between tabs: data opens instantly and writes made
// offline are synced when the connection returns. Falls back to memory
// cache where IndexedDB is unavailable (private mode, some in-app browsers).
function createFirestore(): Firestore {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    }, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    console.warn('Persistent cache unavailable, using memory cache', e);
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
      ignoreUndefinedProperties: true,
    }, firebaseConfig.firestoreDatabaseId);
  }
}
export const db = createFirestore();

// Local development/testing against the Firebase emulators (npm run dev:emulators)
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
}

export const storage = getStorage(app);

export let messaging: any = null;
isMessagingSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export let analytics: any = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

/**
 * Attempts Google login via popup first.
 * If popup is blocked (common on mobile PWAs / in-app browsers),
 * falls back to redirect-based sign-in automatically.
 */
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.warn('Popup login failed.', error?.code, error?.message);

    // User closed the popup on purpose: nothing to do
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return;
    }

    // Popup not possible (blocked / in-app browser): use redirect
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/operation-not-supported-in-this-environment' ||
      error?.code === 'auth/web-storage-unsupported'
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }

    if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/network-request-failed') {
      throw error;
    }

    throw new Error('Erro ao tentar login com Google: ' + (error?.message || 'Erro desconhecido'));
  }
};

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
  'auth/invalid-email': 'Esse e-mail não parece válido.',
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Tente entrar.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/operation-not-allowed': 'Login por e-mail ainda não está ativado no Firebase.',
};

export const authErrorMessage = (error: any) =>
  AUTH_ERRORS[error?.code] || 'Não foi possível continuar. Tente novamente.';

/** Sign in with e-mail and password. */
export const loginWithEmail = async (email: string, pass: string) => {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  } catch (error: any) {
    console.error('Email login failed.', error?.code);
    throw new Error(authErrorMessage(error));
  }
};

/** Create an account with e-mail and password. */
export const signUpWithEmail = async (name: string, email: string, pass: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
      // onAuthStateChanged fired before the name existed: save it on the profile too
      await cred.user.reload();
      await setDoc(doc(db, 'users', cred.user.uid), { displayName: name.trim().slice(0, 60) }, { merge: true }).catch(() => {});
    }
    return cred.user;
  } catch (error: any) {
    console.error('Sign up failed.', error?.code);
    throw new Error(authErrorMessage(error));
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    throw new Error(authErrorMessage(error));
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
