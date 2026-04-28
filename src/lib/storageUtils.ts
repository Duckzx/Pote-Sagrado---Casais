import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a base64 string to Firebase Storage and returns the download URL.
 * @param base64 The base64 string (including data:image/... prefix)
 * @param path The storage path (e.g., 'achievements/selfie.webp')
 */
export const uploadBase64ToStorage = async (base64: string, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  
  // uploadString handles the data:image/... prefix if format is 'data_url'
  const snapshot = await uploadString(storageRef, base64, 'data_url');
  return await getDownloadURL(snapshot.ref);
};

/**
 * Generates a unique path for a file.
 * @param folder Folder name (e.g., 'achievements')
 * @param userId User ID for namespacing
 * @param extension File extension
 */
export const generateStoragePath = (folder: string, userId: string, extension = 'webp'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${folder}/${userId}_${timestamp}_${random}.${extension}`;
};
