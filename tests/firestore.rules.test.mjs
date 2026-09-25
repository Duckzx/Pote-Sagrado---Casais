// Verifica as regras do Firestore contra cada leitura/gravação que o app faz.
// Rode com: npm run test:rules (usa o emulador local, não toca em produção).
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, getDoc, addDoc, collection, updateDoc, deleteDoc, serverTimestamp, arrayUnion, increment, query, where, getDocs, orderBy, limit, Timestamp, writeBatch, getAggregateFromServer, sum } from 'firebase/firestore';

const env = await initializeTestEnvironment({ projectId: 'demo-pote', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8085 } });
const C = 'casal_A';
await env.withSecurityRulesDisabled(async (ctx) => {
  const d = ctx.firestore();
  await setDoc(doc(d, 'users/A'), { casalId: C, inviteCode: 'AAA111', displayName: 'Ana' });
  await setDoc(doc(d, 'users/B'), { casalId: C, inviteCode: 'BBB222', displayName: 'Beto' });
  await setDoc(doc(d, 'users/L'), { inviteCode: 'LLL333' }); // legacy user without casalId
  await setDoc(doc(d, 'users/M'), { casalId: 'casal_M', displayName: 'x'.repeat(150), theme: 123, inviteCode: 'MMMMMMMMMMMMMMMMMMMMMMMMM' }); // dirty legacy profile
  await setDoc(doc(d, 'casais/casal_M/trip_config/main'), { destination: 'y'.repeat(300), goalAmount: '1000', monthlyPrize: 'z'.repeat(400), customChallenges: 'bad' }); // dirty legacy config
  await setDoc(doc(d, `casais/${C}`), { isPremium: true });
  await setDoc(doc(d, `casais/${C}/deposits/d1`), { amount: 10, who: 'A', whoName: 'Ana', createdAt: Timestamp.now(), type: 'income' });
  await setDoc(doc(d, `casais/${C}/deposits/dLegacy`), { amount: '5', who: 'A', createdAt: '2024-01-01' }); // malformed legacy
  await setDoc(doc(d, `casais/${C}/trip_config/main`), { destination: 'Paris', goalAmount: 1000, targetDate: '2027-01-01T00:00:00.000Z' });
});
const A = env.authenticatedContext('A').firestore();
const B = env.authenticatedContext('B').firestore();
const L = env.authenticatedContext('L').firestore();
const results = [];
async function t(name, p, expectOk = true) {
  try { await (expectOk ? assertSucceeds(p) : assertFails(p)); results.push(['OK  ', name]); }
  catch (e) { results.push(['FAIL', name + ' :: ' + (e.message || e).toString().slice(0, 160)]); }
}
await t('set group mode', setDoc(doc(A, `casais/${C}`), { mode: 'grupo', groupName: 'Viagem Bahia' }, { merge: true }));
await t('invalid mode rejected', setDoc(doc(A, `casais/${C}`), { mode: 'trisal' }, { merge: true }), false);
await t('group third member joins', setDoc(doc(env.authenticatedContext('G').firestore(), 'users/G'), { casalId: C }, { merge: true }));
await t('group third member deposits', addDoc(collection(env.authenticatedContext('G').firestore(), `casais/${C}/deposits`), { amount: 3, who: 'G', whoName: 'Gabi', createdAt: serverTimestamp() }));
await t('read couple doc', getDoc(doc(A, `casais/${C}`)));
await t('premium activate', setDoc(doc(A, `casais/${C}`), { isPremium: true }, { merge: true }));
await t('read config', getDoc(doc(B, `casais/${C}/trip_config/main`)));
await t('save config full', setDoc(doc(A, `casais/${C}/trip_config/main`), { goalType: 'travel', destination: 'Roma', origin: 'SP', goalAmount: 5000, customChallenges: [], sharedAlbumUrl: '', relationshipStartDate: '2025-01-01', monthlyPrize: 'jantar', theme: 'rose', updatedAt: serverTimestamp() }, { merge: true }));
await t('config lat/lng', setDoc(doc(A, `casais/${C}/trip_config/main`), { lat: 1.2, lng: 3.4 }, { merge: true }));
await t('config battle', setDoc(doc(B, `casais/${C}/trip_config/main`), { battleChallenges: [{ id: 'x' }] }, { merge: true }));
await t('envelope challenge', setDoc(doc(B, `casais/${C}/trip_config/main`), { envelopes: arrayUnion(7) }, { merge: true }));
await t('diagnostics writes', setDoc(doc(A, `casais/${C}`), { lastActiveAt: 'x' }, { merge: true }));
await t('config fcm', setDoc(doc(B, `casais/${C}/trip_config/main`), { fcmTokens: arrayUnion('tok') }, { merge: true }));
await t('list deposits', getDocs(query(collection(A, `casais/${C}/deposits`), orderBy('createdAt', 'desc'), limit(500))));
await t('aggregate', getAggregateFromServer(collection(A, `casais/${C}/deposits`), { total: sum('amount') }));
await t('add deposit', addDoc(collection(A, `casais/${C}/deposits`), { amount: 12.5, type: 'income', action: 'x', who: 'A', whoName: 'Ana', createdAt: serverTimestamp() }));
await t('add deposit w/ image', addDoc(collection(A, `casais/${C}/deposits`), { amount: 12.5, action: 'x', who: 'A', whoName: 'Ana', createdAt: serverTimestamp(), imageUrl: 'https://x' }));
await t('xp bonus for partner', addDoc(collection(A, `casais/${C}/deposits`), { amount: 0, type: 'income', action: 'x', who: 'B', whoName: 'B', createdAt: serverTimestamp(), isXpBonus: true }));
await t('edit own deposit', setDoc(doc(A, `casais/${C}/deposits/d1`), { amount: 20, action: 'y' }, { merge: true }));
await t('edit own deposit date', updateDoc(doc(A, `casais/${C}/deposits/d1`), { amount: 20, action: 'y', createdAt: new Date('2025-01-01') }));
await t('partner edits deposit', updateDoc(doc(B, `casais/${C}/deposits/d1`), { amount: 30, action: 'z' }));
await t('partner comment', updateDoc(doc(B, `casais/${C}/deposits/d1`), { comments: arrayUnion({ id: '1', text: 'oi', who: 'B', whoName: 'B', createdAt: 1 }) }));
await t('partner reaction', updateDoc(doc(B, `casais/${C}/deposits/d1`), { reactions: { B: '❤️' } }));
await t('comment malformed legacy', updateDoc(doc(B, `casais/${C}/deposits/dLegacy`), { reactions: { B: '❤️' } }));
await t('delete deposit', deleteDoc(doc(B, `casais/${C}/deposits/dLegacy`)));
await t('achievement break pot', addDoc(collection(A, `casais/${C}/achievements`), { destination: 'Roma', amount: 100, goalAmount: 100, who: 'A', createdAt: serverTimestamp() }));
await t('pinboard add', addDoc(collection(A, `casais/${C}/pinboard_links`), { url: 'https://a', title: 'a', imageUrl: 'https://picsum', addedBy: 'A', createdAt: serverTimestamp() }));
await t('gallery add', addDoc(collection(A, `casais/${C}/gallery`), { imageUrl: 'https://a', addedBy: 'A', createdAt: serverTimestamp() }));
await t('gallery list', getDocs(query(collection(B, `casais/${C}/gallery`), orderBy('createdAt', 'desc'))));
await t('love interaction', addDoc(collection(A, `casais/${C}/love_interactions`), { cardId: 'c1', partnerId: 'A', partnerName: 'Ana', hasResponded: true, answer: null, respondedAt: Timestamp.now() }));
await t('love progress', setDoc(doc(A, `casais/${C}/love_progress/main`), { goldDust: increment(10), progress: { love_romance: 1 } }, { merge: true }));
await t('notification create', addDoc(collection(A, `casais/${C}/notifications`), { type: 'love_card_response', cardId: 'c1', from: 'A', to: 'B', timestamp: serverTimestamp(), read: false }));
await t('notification list', getDocs(query(collection(B, `casais/${C}/notifications`), where('to', '==', 'B'), where('read', '==', false))));
const nq = await getDocs(query(collection(B, `casais/${C}/notifications`), where('to', '==', 'B'), where('read', '==', false)));
const batch = writeBatch(B); nq.docs.forEach(d => batch.update(d.ref, { read: true }));
await t('notification mark read', batch.commit());
await t('capsule create', addDoc(collection(A, `casais/${C}/capsules`), { from: 'A', fromName: 'Ana', message: 'oi', openAt: Timestamp.fromDate(new Date(Date.now() + 86400000)), openedAt: null, createdAt: serverTimestamp() }));
await t('capsule list', getDocs(query(collection(B, `casais/${C}/capsules`), orderBy('openAt', 'asc'))));
await t('user profile update', setDoc(doc(A, 'users/A'), { theme: 'rose', displayName: 'Ana', mood: { id: 'x', at: 'now' }, photoURL: 'https://p', email: 'a@a.com', legacyMigratedAt: 'x' }, { merge: true }));
await t('users by casal', getDocs(query(collection(A, 'users'), where('casalId', '==', C))));
await t('users by invite', getDocs(query(collection(A, 'users'), where('inviteCode', '==', 'BBB222'))));
await t('legacy user default casal read', getDoc(doc(L, 'casais/casal_L/trip_config/main')));
await t('legacy user default casal write', addDoc(collection(L, 'casais/casal_L/deposits'), { amount: 1, who: 'L', createdAt: serverTimestamp() }));
await t('legacy root deposits', getDocs(query(collection(L, 'deposits'), where('who', '==', 'L'))));
const M = env.authenticatedContext('M').firestore();
await t('dirty profile: change theme', setDoc(doc(M, 'users/M'), { theme: 'rose' }, { merge: true }));
await t('dirty profile: mood', setDoc(doc(M, 'users/M'), { mood: { id: 'x', at: 'y' } }, { merge: true }));
await t('dirty config: save goal', setDoc(doc(M, 'casais/casal_M/trip_config/main'), { destination: 'Roma', goalAmount: 10 }, { merge: true }));
await t('dirty config: missions', setDoc(doc(M, 'casais/casal_M/trip_config/main'), { battleChallenges: [] }, { merge: true }));
await t('bad theme rejected', setDoc(doc(M, 'users/M'), { theme: 5 }, { merge: true }), false);
await t('bad goal rejected', setDoc(doc(M, 'casais/casal_M/trip_config/main'), { goalAmount: -5 }, { merge: true }), false);
await t('cannot change author', updateDoc(doc(B, `casais/${C}/deposits/d1`), { who: 'B' }), false);
await t('new user create profile', setDoc(doc(env.authenticatedContext('N').firestore(), 'users/N'), { lgpdConsent: false, inviteCode: 'NNN', casalId: 'casal_N', theme: 'rose' }, { merge: true }));
await t('customDates', addDoc(collection(A, 'users/A/customDates'), { title: 'x' }));
await t('outsider cannot read', getDoc(doc(L, `casais/${C}/trip_config/main`)), false);
await t('outsider cannot write', addDoc(collection(L, `casais/${C}/deposits`), { amount: 1, who: 'L', createdAt: serverTimestamp() }), false);
console.log(results.map(r => r.join(' ')).join('\n'));
if (results.some(r => r[0] === 'FAIL')) process.exitCode = 1;
await env.cleanup();
