import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  where,
  getAggregateFromServer,
  sum,
} from 'firebase/firestore';
import { auth, db, handleRedirectResult } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAppStore } from '../store/useAppStore';
import { triggerConnectionCelebration } from '../lib/utils';
import { Deposit, TripConfig, ThemeId, DEFAULT_TRIP_CONFIG } from '../types';

// Deposits kept live in memory (history, charts, missions). The pot total is
// computed over ALL deposits, so couples with a long history don't lose money
// from the balance when they go past this limit.
const DEPOSITS_LIVE_LIMIT = 500;

const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

function normalizeTripConfig(data: Partial<TripConfig> | undefined): TripConfig {
  return {
    ...DEFAULT_TRIP_CONFIG,
    goalType: data?.goalType || 'travel',
    destination: data?.destination || '',
    origin: data?.origin || '',
    goalAmount: Number(data?.goalAmount) || 0,
    lat: Number(data?.lat) || 0,
    lng: Number(data?.lng) || 0,
    customChallenges: Array.isArray(data?.customChallenges) ? data!.customChallenges : [],
    battleChallenges: Array.isArray(data?.battleChallenges) ? data!.battleChallenges : [],
    sharedAlbumUrl: data?.sharedAlbumUrl || '',
    monthlyPrize: data?.monthlyPrize || '',
    relationshipStartDate: data?.relationshipStartDate || '',
    fcmTokens: Array.isArray(data?.fcmTokens) ? data!.fcmTokens : [],
  };
}

function readCachedTripConfig(casalId: string): TripConfig | null {
  try {
    const raw = localStorage.getItem(`pote_tripConfig_${casalId}`);
    return raw ? normalizeTripConfig(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Sum of all deposits of the couple computed on the server
 * (income - expense). Deposits without `type` are income (legacy data).
 */
async function fetchServerTotal(casalId: string): Promise<number | null> {
  try {
    const depositsRef = collection(db, `casais/${casalId}/deposits`);
    const [all, expenses] = await Promise.all([
      getAggregateFromServer(depositsRef, { total: sum('amount') }),
      getAggregateFromServer(query(depositsRef, where('type', '==', 'expense')), { total: sum('amount') }),
    ]);
    const allTotal = all.data().total || 0;
    const expenseTotal = expenses.data().total || 0;
    return allTotal - 2 * expenseTotal;
  } catch (e) {
    console.warn('Could not compute server total, using local sum', e);
    return null;
  }
}

/**
 * Old versions of the app stored deposits in the root `deposits` collection.
 * Copy the ones owned by this user into the couple's space (same ids, so the
 * copy is idempotent) without deleting the originals.
 */
async function migrateLegacyData(uid: string, casalId: string) {
  let migrated = 0;
  try {
    const legacyDeposits = await getDocs(query(collection(db, 'deposits'), where('who', '==', uid)));
    for (const d of legacyDeposits.docs) {
      try {
        await setDoc(doc(db, `casais/${casalId}/deposits`, d.id), d.data(), { merge: true });
        migrated++;
      } catch (e) {
        console.warn('Legacy deposit not migrated', d.id, e);
      }
    }
  } catch (e) {
    console.warn('Legacy deposits unavailable', e);
  }

  try {
    const legacyGallery = await getDocs(query(collection(db, 'gallery'), where('addedBy', '==', uid)));
    for (const g of legacyGallery.docs) {
      try {
        await setDoc(doc(db, `casais/${casalId}/gallery`, g.id), g.data(), { merge: true });
        migrated++;
      } catch (e) {
        console.warn('Legacy photo not migrated', g.id, e);
      }
    }
  } catch (e) {
    console.warn('Legacy gallery unavailable', e);
  }

  try {
    await setDoc(doc(db, 'users', uid), { legacyMigratedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Could not flag legacy migration', e);
  }
  return migrated;
}

export function useFirebaseSync() {
  const user = useAppStore(s => s.user);
  const isAuthReady = useAppStore(s => s.isAuthReady);

  useEffect(() => {
    const store = useAppStore.getState();

    // Check invite param in URL
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode) {
      localStorage.setItem('pote_invite_code', inviteCode);
      params.delete('invite');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }

    // Finish a redirect-based sign-in (mobile / in-app browsers)
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      store.setUser(currentUser);
      store.setIsAuthReady(true);

      if (currentUser) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${currentUser.uid}`);
        if (!hasSeenOnboarding) {
          store.setShowOnboarding(true);
        }
      } else {
        // Logged out - clear state
        useAppStore.getState().resetData();
        store.setLgpdConsent(!!localStorage.getItem('pote_lgpdConsent'));
        store.setHasCheckedConsent(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const {
      setCasalId,
      setTheme,
      setLgpdConsent,
      setHasCheckedConsent,
      setTripConfig,
      setCoupleMembers,
      setDeposits,
      setTotalSaved,
      setBingoStats,
      setIsDataReady,
      setAchievements,
      setPinboardLinks,
      setPremium,
      addToast,
    } = useAppStore.getState();

    let disposed = false;

    // Apply pending invite (link ?invite=CODE)
    const pendingInvite = localStorage.getItem('pote_invite_code');
    if (pendingInvite) {
      const applyInvite = async () => {
        try {
          const { resolveInviteCasalId, migrateUserToAnotherCouple } = await import('../lib/couple-migration');
          const resolvedCasalId = await resolveInviteCasalId(pendingInvite, user.uid);
          if (!resolvedCasalId) {
            localStorage.removeItem('pote_invite_code');
            return;
          }

          const myDoc = await getDoc(doc(db, 'users', user.uid));
          const myCurrentCasalId = (myDoc.exists() && myDoc.data().casalId) || `casal_${user.uid}`;

          if (resolvedCasalId !== myCurrentCasalId) {
            await migrateUserToAnotherCouple(user.uid, myCurrentCasalId, resolvedCasalId);
            addToast('Casal Conectado!', 'Seus perfis foram vinculados.', 'success');
            triggerConnectionCelebration();
          }
          localStorage.removeItem('pote_invite_code');
        } catch (e) {
          console.error('Error applying pending invite', e);
          addToast('Convite', 'Não foi possível aplicar o convite. Tente pelo código em Configurações.', 'info');
        }
      };
      applyInvite();
    }

    let lastCasalId: string | null = null;
    let currentUnsubs: (() => void)[] = [];
    let legacyChecked = false;
    let totalRequestId = 0;

    const markReady = () => {
      if (!disposed) setIsDataReady(true);
    };

    const startCoupleListeners = (currentCasalId: string) => {
      lastCasalId = currentCasalId;
      setCasalId(currentCasalId);

      // Clear previous nested listeners
      currentUnsubs.forEach(unsub => unsub());
      currentUnsubs = [];

      // Reset data from a previous couple, using the local cache (if any) so
      // the app opens instantly and works offline.
      setTripConfig(readCachedTripConfig(currentCasalId));
      setDeposits([]);
      setTotalSaved(0);
      setBingoStats({});
      setAchievements([]);
      setPinboardLinks([]);
      setCoupleMembers([]);
      setPremium(false);
      setIsDataReady(false);

      // Never keep the user stuck on the loading skeleton
      const readyFallback = setTimeout(markReady, 6000);
      currentUnsubs.push(() => clearTimeout(readyFallback));

      // Couple document (premium status)
      const unsubCasal = onSnapshot(doc(db, 'casais', currentCasalId), (casalSnap) => {
        const fromCache = casalSnap.metadata.fromCache;
        if (casalSnap.exists()) {
          setPremium(!!casalSnap.data().isPremium);
        } else if (!fromCache) {
          setDoc(doc(db, 'casais', currentCasalId), { createdAt: new Date().toISOString(), isPremium: false }, { merge: true })
            .catch(e => console.warn('Could not create couple doc', e));
          setPremium(false);
        }
      }, (error) => console.warn('Couple doc listener error', error));
      currentUnsubs.push(unsubCasal);

      // Goal / trip config
      const unsubConfig = onSnapshot(doc(db, `casais/${currentCasalId}/trip_config`, 'main'), (configSnap) => {
        const fromCache = configSnap.metadata.fromCache;
        if (configSnap.exists()) {
          const newConfig = normalizeTripConfig(configSnap.data() as TripConfig);
          localStorage.setItem(`pote_tripConfig_${currentCasalId}`, JSON.stringify(newConfig));
          setTripConfig(newConfig);
        } else if (!fromCache || !useAppStore.getState().tripConfig) {
          setTripConfig(normalizeTripConfig(undefined));
        }
      }, (error) => {
        if (!useAppStore.getState().tripConfig) setTripConfig(normalizeTripConfig(undefined));
        handleFirestoreError(error, OperationType.GET, `casais/${currentCasalId}/trip_config/main`);
      });
      currentUnsubs.push(unsubConfig);

      // Couple members
      const unsubMembers = onSnapshot(query(collection(db, 'users'), where('casalId', '==', currentCasalId)), (membersSnap) => {
        const members: any[] = [];
        membersSnap.forEach(m => members.push({ id: m.id, uid: m.id, ...m.data() }));
        setCoupleMembers(members);
      }, (error) => console.warn('Members listener error', error));
      currentUnsubs.push(unsubMembers);

      // Deposits
      const depositsQuery = query(
        collection(db, `casais/${currentCasalId}/deposits`),
        orderBy('createdAt', 'desc'),
        limit(DEPOSITS_LIVE_LIMIT),
      );

      let isInitialLoadDeposits = true;

      const unsubDeposits = onSnapshot(depositsQuery, { includeMetadataChanges: false }, (querySnapshot) => {
        const deps: Deposit[] = [];
        let total = 0;
        const stats: Record<string, number> = {};

        if (!isInitialLoadDeposits) {
          querySnapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) {
              const data = change.doc.data();
              if (data.isXpBonus === true && data.who === user.uid) {
                const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=coin-pickup-98269.mp3');
                audio.play().catch(() => {});
                addToast('Bônus Recebido! 🎁', data.action || 'Seu parceiro compartilhou a jornada e você ganhou XP!', 'success');
              }
            }
          });
        }
        isInitialLoadDeposits = false;

        querySnapshot.forEach((depositSnap) => {
          const data = depositSnap.data({ serverTimestamps: 'estimate' });
          deps.push({ id: depositSnap.id, ...data } as Deposit);

          const amount = Number(data.amount) || 0;
          total += data.type === 'expense' ? -amount : amount;

          if (data.action && data.type !== 'expense') {
            stats[data.action] = (stats[data.action] || 0) + 1;
          }
        });

        setDeposits(deps);
        setBingoStats(stats);

        if (querySnapshot.size < DEPOSITS_LIVE_LIMIT) {
          // Every deposit is in memory: the local sum is exact (and works offline)
          setTotalSaved(total);
          localStorage.setItem('pote_totalSaved', total.toString());
        } else {
          // Long history: ask the server for the full sum
          setTotalSaved(total);
          const requestId = ++totalRequestId;
          fetchServerTotal(currentCasalId).then((serverTotal) => {
            if (disposed || requestId !== totalRequestId || serverTotal === null) return;
            setTotalSaved(serverTotal);
            localStorage.setItem('pote_totalSaved', serverTotal.toString());
          });
        }

        markReady();
      }, (error) => {
        markReady();
        handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/deposits`);
      });
      currentUnsubs.push(unsubDeposits);

      // Achievements
      const qArchived = query(collection(db, `casais/${currentCasalId}/achievements`), orderBy('createdAt', 'desc'));
      const unsubAchievements = onSnapshot(qArchived, (querySnapshot) => {
        const arch: any[] = [];
        querySnapshot.forEach(docSnap => arch.push({ id: docSnap.id, ...docSnap.data({ serverTimestamps: 'estimate' }) }));
        setAchievements(arch);
      }, (error) => console.warn('Achievements listener error', error));
      currentUnsubs.push(unsubAchievements);

      // Pinboard links
      const qLinks = query(collection(db, `casais/${currentCasalId}/pinboard_links`), orderBy('createdAt', 'desc'));
      const unsubLinks = onSnapshot(qLinks, (querySnapshot) => {
        const linksData: any[] = [];
        querySnapshot.forEach(docSnap => linksData.push({ id: docSnap.id, ...docSnap.data({ serverTimestamps: 'estimate' }) }));
        setPinboardLinks(linksData);
      }, (error) => console.warn('Pinboard listener error', error));
      currentUnsubs.push(unsubLinks);
    };

    // User profile: theme, consent and which couple the user belongs to
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      let currentCasalId = `casal_${user.uid}`; // default for users who never linked a partner
      const profileUpdates: Record<string, unknown> = {};
      const fromCache = docSnap.metadata.fromCache;

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme) {
          const currentTheme = data.theme as ThemeId;
          setTheme(currentTheme);
          localStorage.setItem('pote_theme', currentTheme);
        }
        if (data.casalId) {
          currentCasalId = data.casalId;
        }
        setLgpdConsent(!!data.lgpdConsent);
        setHasCheckedConsent(true);

        if (!fromCache) {
          if (!data.inviteCode) profileUpdates.inviteCode = generateInviteCode();
          // Persist the implicit couple id so the partner can find this user
          if (!data.casalId) profileUpdates.casalId = currentCasalId;
          if (!data.displayName && (user.displayName || user.email)) {
            profileUpdates.displayName = user.displayName || user.email?.split('@')[0];
          }
          if (!data.email && user.email) profileUpdates.email = user.email;

          if (!legacyChecked && !data.legacyMigratedAt) {
            legacyChecked = true;
            migrateLegacyData(user.uid, currentCasalId).then((count) => {
              if (count > 0 && !disposed) {
                addToast('Dados recuperados', `${count} registro(s) antigos foram restaurados no seu pote.`, 'success');
              }
            });
          }
          legacyChecked = true;
        }
      } else if (!fromCache) {
        profileUpdates.lgpdConsent = false;
        profileUpdates.inviteCode = generateInviteCode();
        profileUpdates.casalId = currentCasalId;
        if (user.displayName || user.email) profileUpdates.displayName = user.displayName || user.email?.split('@')[0];
        if (user.email) profileUpdates.email = user.email;
        setLgpdConsent(false);
        setHasCheckedConsent(true);
      }

      if (Object.keys(profileUpdates).length > 0) {
        setDoc(doc(db, 'users', user.uid), profileUpdates, { merge: true })
          .catch(e => console.warn('Could not update profile', e));
      }

      // Only restart listeners if the couple changed
      if (lastCasalId === currentCasalId) return;
      startCoupleListeners(currentCasalId);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      // Fall back to the default couple so the app is still usable
      if (!lastCasalId) {
        setHasCheckedConsent(true);
        startCoupleListeners(`casal_${user.uid}`);
      }
    });

    return () => {
      disposed = true;
      unsubUser();
      currentUnsubs.forEach(unsub => unsub());
    };
  }, [isAuthReady, user]);
}
