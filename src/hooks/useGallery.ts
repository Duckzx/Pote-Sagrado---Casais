import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAppStore } from '../store/useAppStore';

export interface GalleryPhoto {
    id: string;
    imageBase64?: string;
    imageUrl?: string;
    createdAt: any;
    addedBy: string;
}

/**
 * Shared photo album of the couple, synced in real time between devices.
 */
export function useGallery() {
    const casalId = useAppStore(s => s.casalId);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

    useEffect(() => {
        if (!casalId) {
            setPhotos([]);
            return;
        }
        const q = query(collection(db, `casais/${casalId}/gallery`), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) } as GalleryPhoto));
            setPhotos(data);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${casalId}/gallery`));

        return () => unsub();
    }, [casalId]);

    const addImage = async (image: string) => {
        if (!auth.currentUser || !casalId) return;
        // compressImage returns a Storage URL, or a base64 data URI as fallback
        const field = image.startsWith('data:') ? 'imageBase64' : 'imageUrl';
        try {
            await addDoc(collection(db, `casais/${casalId}/gallery`), {
                [field]: image,
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
            await deleteDoc(doc(db, `casais/${casalId}/gallery`, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `casais/${casalId}/gallery/${id}`);
        }
    };

    return { photos, addPhoto: addImage, addPhotoUrl: addImage, removePhoto };
}
