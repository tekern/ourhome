/**
 * IndexedDB photo storage utility for S-Hygiene
 * Stores compressed photos (max 800px, JPEG 0.7) to avoid localStorage quota issues.
 */

const DB_NAME = 's_hygiene_photos_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

export interface PhotoRecord {
  id: string;
  dataUrl: string;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Resizes an image file to max dimension 800px and JPEG quality 0.7
 */
export function resizeAndCompressImage(file: File, maxDimension = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a compressed photo data URL to IndexedDB
 */
export async function savePhotoToIdb(id: string, dataUrl: string): Promise<string> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: PhotoRecord = {
        id,
        dataUrl,
        timestamp: Date.now(),
      };
      const req = store.put(record);

      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save photo to IndexedDB', err);
    throw new Error('사진을 저장하지 못했어요. 다시 찍어주세요');
  }
}

/**
 * Retrieves a photo data URL from IndexedDB by id
 */
export async function getPhotoFromIdb(id: string): Promise<string | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const result = req.result as PhotoRecord | undefined;
        resolve(result ? result.dataUrl : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get photo from IndexedDB', err);
    return null;
  }
}

/**
 * Deletes a photo from IndexedDB
 */
export async function deletePhotoFromIdb(id: string): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete photo from IndexedDB', err);
  }
}

/**
 * Clears all photos from IndexedDB
 */
export async function clearAllPhotosFromIdb(): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear photos from IndexedDB', err);
  }
}
