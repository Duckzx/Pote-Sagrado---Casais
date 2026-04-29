import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const compressImage = (file: File, maxWidth = 600, maxQuality = 0.5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to base64 webp
        const compressedBase64 = canvas.toDataURL('image/webp', maxQuality);
        
        // Convert base64 to blob
        try {
          const res = await fetch(compressedBase64);
          const blob = await res.blob();
          const fileName = `images/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);
          resolve(downloadUrl);
        } catch (e) {
          console.warn("Storage upload failed, falling back to base64", e);
          resolve(compressedBase64);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
