import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy, limit, getDocs, getDoc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db, handleRedirectResult } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAppStore } from '../store/useAppStore';
import { triggerConnectionCelebration } from '../lib/utils';
import { Deposit, TripConfig, ThemeId } from '../types';

export function useFirebaseSync() {
  const user = useAppStore(s => s.user);
  const isAuthReady = useAppStore(s => s.isAuthReady);
  
  const setUser = useAppStore(s => s.setUser);
  const setCasalId = useAppStore(s => s.setCasalId);
  const setIsAuthReady = useAppStore(s => s.setIsAuthReady);
  const setShowOnboarding = useAppStore(s => s.setShowOnboarding);
  const setLgpdConsent = useAppStore(s => s.setLgpdConsent);
  const setHasCheckedConsent = useAppStore(s => s.setHasCheckedConsent);
  const setTheme = useAppStore(s => s.setTheme);
  const setTripConfig = useAppStore(s => s.setTripConfig);
  const setCoupleMembers = useAppStore(s => s.setCoupleMembers);
  const setDeposits = useAppStore(s => s.setDeposits);
  const setTotalSaved = useAppStore(s => s.setTotalSaved);
  const setBingoStats = useAppStore(s => s.setBingoStats);
  const setIsDataReady = useAppStore(s => s.setIsDataReady);
  const setAchievements = useAppStore(s => s.setAchievements);
  const setPinboardLinks = useAppStore(s => s.setPinboardLinks);

  // We need addToast here for error and success
  // Currently useAppStore has setToasts, we should add addToast to useAppStore
  // Wait, I can just get addToast from the store once we add it. Or just manually add.
  const addToast = useAppStore(s => s.addToast);

  useEffect(() => {
    // Check invite param in URL
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode) {
      localStorage.setItem('pote_invite_code', inviteCode);
      params.delete('invite');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }

    // Check if the user is logging in from a redirect (e.g. from mobile Instagram browser bypassing popup)
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${currentUser.uid}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } else {
        // Logged out - clear state
        useAppStore.getState().resetData();
        setLgpdConsent(!!localStorage.getItem('pote_lgpdConsent'));
        setHasCheckedConsent(true);
      }
    });
    return () => unsubscribe();
  }, [setUser, setIsAuthReady, setShowOnboarding, setLgpdConsent, setHasCheckedConsent]);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Apply pending invite
    const pendingInvite = localStorage.getItem('pote_invite_code');
    if (pendingInvite) {
      const applyInvite = async () => {
        try {
          const { migrateUserToAnotherCouple } = await import('../lib/couple-migration');
          
          let resolvedCasalId = pendingInvite;
          if (!pendingInvite.startsWith('casal_')) {
            const q = query(collection(db, 'users'), where('inviteCode', '==', pendingInvite));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const partnerDoc = snap.docs[0];
              if (partnerDoc.id === user.uid) {
                localStorage.removeItem('pote_invite_code');
                return;
              }
              resolvedCasalId = partnerDoc.data().casalId || `casal_${partnerDoc.id}`;
            }
          }
          
          const myDoc = await getDoc(doc(db, 'users', user.uid));
          const myCurrentCasalId = myDoc.exists() ? (myDoc.data().casalId || `casal_${user.uid}`) : `casal_${user.uid}`;

          if (resolvedCasalId !== myCurrentCasalId) {
            await migrateUserToAnotherCouple(user.uid, myCurrentCasalId, resolvedCasalId);
            if (addToast) addToast("Casal Conectado!", "Seus perfis foram vinculados.", "success");
            triggerConnectionCelebration();
          }
          localStorage.removeItem('pote_invite_code');
        } catch (e) {
          console.error("Error setting pending invite", e);
        }
      };
      applyInvite();
    }

    let currentUnsubs: (() => void)[] = [];

    // Listen to user profile for theme and casalId
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      let currentCasalId = `casal_${user.uid}`; // default
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.inviteCode) {
           const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
           setDoc(doc(db, 'users', user.uid), { inviteCode: newCode }, { merge: true });
        }
        if (data.theme) {
          const t = data.theme as ThemeId;
          setTheme(t);
          localStorage.setItem('pote_theme', t);
        }
        if (data.casalId) {
          currentCasalId = data.casalId;
        }
        setLgpdConsent(!!data.lgpdConsent);
        setHasCheckedConsent(true);
      } else {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setDoc(doc(db, 'users', user.uid), { lgpdConsent: false, inviteCode: newCode }, { merge: true });
        setLgpdConsent(false);
        setHasCheckedConsent(true);
      }
      setCasalId(currentCasalId);
      
      // Clear previous nested unsubs if casalId changed or on re-run
      currentUnsubs.forEach(unsub => unsub());
      currentUnsubs = [];

      // Reset specific data before loading new couple's data
      setTripConfig(null);
      setDeposits([]);
      setTotalSaved(0);
      setBingoStats({});
      setAchievements([]);

      // Listen to config
      const unsubConfig = onSnapshot(doc(db, `casais/${currentCasalId}/trip_config`, 'main'), (configSnap) => {
        if (configSnap.exists()) {
          const data = configSnap.data() as TripConfig;
          // IMPORTANT: Do NOT merge with prev here, as prev might be from a different user session
          const newConfig = { 
            goalType: data.goalType || 'travel',
            destination: data.destination || '',
            origin: data.origin || '',
            goalAmount: data.goalAmount || 0,
            lat: data.lat || 0,
            lng: data.lng || 0,
            customChallenges: data.customChallenges || [],
            battleChallenges: data.battleChallenges || [],
            sharedAlbumUrl: data.sharedAlbumUrl || '',
            monthlyPrize: data.monthlyPrize || '',
            relationshipStartDate: data.relationshipStartDate || ''
          };
          localStorage.setItem(`pote_tripConfig_${currentCasalId}`, JSON.stringify(newConfig));
          setTripConfig(newConfig);
        } else {
          // New couple, provide default empty config
          const defaultConfig: TripConfig = { 
            goalType: 'travel', 
            destination: '', 
            origin: '', 
            goalAmount: 0, 
            lat: 0, 
            lng: 0, 
            customChallenges: [], 
            battleChallenges: [], 
            sharedAlbumUrl: '', 
            monthlyPrize: '',
            relationshipStartDate: ''
          };
          setTripConfig(defaultConfig);
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `casais/${currentCasalId}/trip_config/main`));
      currentUnsubs.push(unsubConfig);

      // Listen to couple members
      const unsubMembers = onSnapshot(query(collection(db, 'users'), where('casalId', '==', currentCasalId)), (membersSnap) => {
        const members: any[] = [];
        membersSnap.forEach(m => members.push({ id: m.id, ...m.data() }));
        setCoupleMembers(members);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
      currentUnsubs.push(unsubMembers);

      if (!(window as any)._hasRunMigration && auth.currentUser) {
        (window as any)._hasRunMigration = true;
        const runMigration = async () => {
          try {
            const oldDeps = await getDocs(query(collection(db, 'deposits'), where('who', '==', auth.currentUser!.uid)));
            oldDeps.docs.forEach(async (d) => {
              await setDoc(doc(db, `casais/${currentCasalId}/deposits`, d.id), d.data());
              await deleteDoc(doc(db, 'deposits', d.id));
            });

            const oldConfig = await getDoc(doc(db, 'trip_config', 'main'));
            if (oldConfig.exists()) {
              const currentConfig = await getDoc(doc(db, `casais/${currentCasalId}/trip_config`, 'main'));
              if (!currentConfig.exists()) {
                await setDoc(doc(db, `casais/${currentCasalId}/trip_config`, 'main'), oldConfig.data());
              }
            }
          } catch (e) {
            console.error("Migration error:", e);
          }
        };
        runMigration();
      }

      // Listen to deposits
      const q = query(
        collection(db, `casais/${currentCasalId}/deposits`), 
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      
      let isInitialLoadDeposits = true;
      
      const unsubDeposits = onSnapshot(q, (querySnapshot) => {
        const deps: Deposit[] = [];
        let total = 0;
        const stats: Record<string, number> = {};

        if (!isInitialLoadDeposits) {
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              if (data.isXpBonus === true && data.who === user.uid) {
                const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=coin-pickup-98269.mp3");
                audio.play().catch(() => {});
                if (addToast) addToast("Bônus Recebido! 🎁", data.action || "Seu parceiro compartilhou a jornada e você ganhou XP!", "success");
              }
            }
          });
        }
        isInitialLoadDeposits = false;

        querySnapshot.forEach((depositSnap) => {
          const data = depositSnap.data();
          deps.push({ id: depositSnap.id, ...data } as Deposit);

          if (data.type === 'expense') {
            total -= data.amount || 0;
          } else {
            total += data.amount || 0;
          }

          if (data.action && data.type !== 'expense') {
            stats[data.action] = (stats[data.action] || 0) + 1;
          }
        });

        setDeposits(deps);
        setTotalSaved(total);
        localStorage.setItem('pote_totalSaved', total.toString());
        setBingoStats(stats);
        
        setTimeout(() => setIsDataReady(true), 200);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/deposits`));
      currentUnsubs.push(unsubDeposits);

      // Listen to achievements
      const qArchived = query(collection(db, `casais/${currentCasalId}/achievements`), orderBy('createdAt', 'desc'));
      const unsubAchievements = onSnapshot(qArchived, (querySnapshot) => {
        const arch: any[] = [];
        querySnapshot.forEach(docSnap => arch.push({ id: docSnap.id, ...docSnap.data() }));
        setAchievements(arch);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/achievements`));
      currentUnsubs.push(unsubAchievements);

      // Listen to pinboard links
      const qLinks = query(collection(db, `casais/${currentCasalId}/pinboard_links`), orderBy('createdAt', 'desc'));
      const unsubLinks = onSnapshot(qLinks, (querySnapshot) => {
        const linksData: any[] = [];
        querySnapshot.forEach(docSnap => linksData.push({ id: docSnap.id, ...docSnap.data() }));
        setPinboardLinks(linksData);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/pinboard_links`));
      currentUnsubs.push(unsubLinks);

    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubUser();
      currentUnsubs.forEach(unsub => unsub());
    };
  }, [isAuthReady, user, setCasalId, setTheme, setLgpdConsent, setHasCheckedConsent, setTripConfig, setCoupleMembers, setDeposits, setTotalSaved, setBingoStats, setIsDataReady, setAchievements, setPinboardLinks, addToast]);
}
