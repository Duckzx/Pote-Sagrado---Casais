import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAppContext } from '../context/AppContext';

export interface GalleryPhoto {
    id: string;
    imageBase64?: string;
    imageUrl?: string;
    createdAt: any;
    addedBy: string;
}

export function useGallery() {
    const { casalId } = useAppContext();
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

    useEffect(() => {
        if (!casalId) return;
        const q = query(collection(db, 'casais', casalId, 'gallery'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryPhoto));
            setPhotos(data);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${casalId}/gallery`));

        return () => unsub();
    }, [casalId]);

    const addPhoto = async (imageBase64: string) => {
        if (!auth.currentUser || !casalId) return;
        try {
            await addDoc(collection(db, 'casais', casalId, 'gallery'), {
                imageBase64,
                createdAt: serverTimestamp(),
                addedBy: auth.currentUser.uid
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/gallery`);
        }
    };

    const addPhotoUrl = async (imageUrl: string) => {
        if (!auth.currentUser || !casalId) return;
        try {
            await addDoc(collection(db, 'casais', casalId, 'gallery'), {
                imageUrl,
                createdAt: serverTimestamp(),
                addedBy: auth.currentUser.uid
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `casais/${casalId}/gallery`);
        }
    };

    const removePhoto = async (id: string) => {
        if (!casalId) return;
        try {
            await deleteDoc(doc(db, 'casais', casalId, 'gallery', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `casais/${casalId}/gallery/${id}`);
        }
    };

    return { photos, addPhoto, addPhotoUrl, removePhoto };
}
