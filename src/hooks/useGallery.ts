import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface GalleryPhoto {
    id: string;
    imageBase64?: string;
    imageUrl?: string;
    createdAt: any;
    addedBy: string;
}

export function useGallery() {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryPhoto));
            setPhotos(data);
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'gallery'));

        return () => unsub();
    }, []);

    const addPhoto = async (imageBase64: string) => {
        if (!auth.currentUser) return;
        try {
            await addDoc(collection(db, 'gallery'), {
                imageBase64,
                createdAt: serverTimestamp(),
                addedBy: auth.currentUser.uid
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'gallery');
        }
    };

    const addPhotoUrl = async (imageUrl: string) => {
        if (!auth.currentUser) return;
        try {
            await addDoc(collection(db, 'gallery'), {
                imageUrl,
                createdAt: serverTimestamp(),
                addedBy: auth.currentUser.uid
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'gallery');
        }
    };

    const removePhoto = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'gallery', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
        }
    };

    return { photos, addPhoto, addPhotoUrl, removePhoto };
}
