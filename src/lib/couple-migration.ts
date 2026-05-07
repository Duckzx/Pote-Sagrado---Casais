import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function migrateUserToAnotherCouple(userId: string, currentCasalId: string, newCasalId: string) {
  if (currentCasalId === newCasalId) return;
  if (!currentCasalId || !newCasalId) return;

  try {
    // 1. Move all deposits owned by this user
    const depsQ = query(collection(db, `casais/${currentCasalId}/deposits`), where('who', '==', userId));
    const depsSnap = await getDocs(depsQ);
    
    // Process them in parallel
    const depositPromises = depsSnap.docs.map(async (d) => {
      // Save it to new
      await setDoc(doc(db, `casais/${newCasalId}/deposits`, d.id), d.data(), { merge: true });
      // Delete from old
      await deleteDoc(doc(db, `casais/${currentCasalId}/deposits`, d.id));
    });
    await Promise.all(depositPromises);

    // 2. Move achievements owned by this user
    const achsQ = query(collection(db, `casais/${currentCasalId}/achievements`), where('who', '==', userId));
    const achsSnap = await getDocs(achsQ);
    const achsPromises = achsSnap.docs.map(async (d) => {
      await setDoc(doc(db, `casais/${newCasalId}/achievements`, d.id), d.data(), { merge: true });
      await deleteDoc(doc(db, `casais/${currentCasalId}/achievements`, d.id));
    });
    await Promise.all(achsPromises);

    // 3. Move pinboard links owned by this user
    const linksQ = query(collection(db, `casais/${currentCasalId}/pinboard_links`), where('addedBy', '==', userId));
    const linksSnap = await getDocs(linksQ);
    const linksPromises = linksSnap.docs.map(async (d) => {
      await setDoc(doc(db, `casais/${newCasalId}/pinboard_links`, d.id), d.data(), { merge: true });
      await deleteDoc(doc(db, `casais/${currentCasalId}/pinboard_links`, d.id));
    });
    await Promise.all(linksPromises);

    // 4. Move gallery photos owned by this user
    const galleryQ = query(collection(db, `casais/${currentCasalId}/gallery`), where('addedBy', '==', userId));
    const gallerySnap = await getDocs(galleryQ);
    const galleryPromises = gallerySnap.docs.map(async (d) => {
      await setDoc(doc(db, `casais/${newCasalId}/gallery`, d.id), d.data(), { merge: true });
      await deleteDoc(doc(db, `casais/${currentCasalId}/gallery`, d.id));
    });
    await Promise.all(galleryPromises);

    // Update their user document to point to the new casalId
    await setDoc(doc(db, 'users', userId), { casalId: newCasalId }, { merge: true });

  } catch (err) {
    console.error("Error migrating couple data", err);
  }
}
