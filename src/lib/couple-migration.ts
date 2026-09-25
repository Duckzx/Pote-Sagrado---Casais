import { collection, query, where, getDocs, doc, setDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Resolves an invite (partner invite code or a raw `casal_...` id) to the
 * couple id it points to. Returns null if the code is invalid or is the
 * user's own code.
 */
export async function resolveInviteCasalId(rawCode: string, userId: string): Promise<string | null> {
  const code = rawCode.trim();
  if (!code) return null;
  if (code.startsWith('casal_')) return code;

  const snap = await getDocs(query(collection(db, 'users'), where('inviteCode', '==', code.toUpperCase())));
  if (snap.empty) return null;

  const partnerDoc = snap.docs[0];
  if (partnerDoc.id === userId) return null;
  return partnerDoc.data().casalId || `casal_${partnerDoc.id}`;
}

const OWNED_COLLECTIONS: { name: string; ownerField: string }[] = [
  { name: 'deposits', ownerField: 'who' },
  { name: 'achievements', ownerField: 'who' },
  { name: 'pinboard_links', ownerField: 'addedBy' },
  { name: 'gallery', ownerField: 'addedBy' },
  { name: 'capsules', ownerField: 'from' },
];

/**
 * Moves the user to another couple, bringing along the records they own.
 *
 * Order matters for the security rules: the user can only write into the new
 * couple after their profile points to it. So we (1) read everything from the
 * current couple, (2) switch the profile, (3) copy into the new couple and
 * (4) best-effort delete the old copies. Nothing is deleted unless the copy
 * succeeded, so data is never lost.
 */
export async function migrateUserToAnotherCouple(userId: string, currentCasalId: string, newCasalId: string) {
  if (!currentCasalId || !newCasalId || currentCasalId === newCasalId) return;

  // 1. Snapshot the user's records while still a member of the current couple
  const toMove: { collectionName: string; id: string; data: DocumentData }[] = [];
  for (const { name, ownerField } of OWNED_COLLECTIONS) {
    try {
      const snap = await getDocs(query(collection(db, `casais/${currentCasalId}/${name}`), where(ownerField, '==', userId)));
      snap.docs.forEach(d => toMove.push({ collectionName: name, id: d.id, data: d.data() }));
    } catch (e) {
      console.warn(`Could not read ${name} from ${currentCasalId}`, e);
    }
  }

  // 2. Point the profile to the new couple (this is what grants access to it)
  await setDoc(doc(db, 'users', userId), { casalId: newCasalId }, { merge: true });

  // 3 + 4. Copy, then remove the old copy
  await Promise.all(toMove.map(async ({ collectionName, id, data }) => {
    try {
      await setDoc(doc(db, `casais/${newCasalId}/${collectionName}`, id), data, { merge: true });
    } catch (e) {
      console.error(`Could not copy ${collectionName}/${id}`, e);
      return;
    }
    try {
      await deleteDoc(doc(db, `casais/${currentCasalId}/${collectionName}`, id));
    } catch (e) {
      console.warn(`Old copy of ${collectionName}/${id} kept in ${currentCasalId}`, e);
    }
  }));
}
