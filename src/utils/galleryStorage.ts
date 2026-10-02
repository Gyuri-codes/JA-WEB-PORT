import { GalleryImage } from '../types';

const DB_NAME = 'JA_GALLERY_DB_V2';
const DB_VERSION = 1;
const STORE_NAME = 'gallery_items_v2';

// Ensure any legacy trial databases from earlier test versions are cleaned up
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('ja_gallery_fallback_v1');
    if (window.indexedDB && window.indexedDB.deleteDatabase) {
      window.indexedDB.deleteDatabase('JA_GALLERY_DB_V1');
    }
  } catch {
    // Ignore legacy cleanup errors
  }
}

function openGalleryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open gallery database'));
  });
}

/**
 * Loads all stored gallery images from IndexedDB.
 * Only returns images uploaded specifically to the Gallery (unlimited).
 * Excludes images from any other sections of the portfolio.
 */
export async function loadGalleryImages(): Promise<GalleryImage[]> {
  try {
    const db = await openGalleryDB();
    return new Promise<GalleryImage[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const rawItems: GalleryImage[] = request.result || [];
        // Only return images uploaded specifically to this gallery
        const manualItems = rawItems.filter((item) => !item.id.startsWith('starter-'));
        manualItems.sort((a, b) => b.uploadedAt - a.uploadedAt);
        resolve(manualItems);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not load gallery images from IndexedDB, falling back to localStorage:', err);
    try {
      const fallback = localStorage.getItem('ja_gallery_manual_v2');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: GalleryImage) => !item.id.startsWith('starter-'));
        }
      }
    } catch {
      // ignore fallback error
    }
    return [];
  }
}

/**
 * Saves a single gallery image (unlimited capacity).
 */
export async function saveGalleryImage(image: GalleryImage): Promise<{ success: boolean; reason?: string }> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(image);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to save gallery image:', err);
    return { success: false, reason: 'Failed to write to local storage.' };
  }
}

/**
 * Saves multiple gallery images (unlimited capacity).
 */
export async function saveMultipleGalleryImages(
  newImages: GalleryImage[]
): Promise<{ added: number; total: number }> {
  try {
    const currentImages = await loadGalleryImages();
    const db = await openGalleryDB();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      newImages.forEach((img) => store.put(img));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const newTotal = currentImages.length + newImages.length;
    return {
      added: newImages.length,
      total: newTotal,
    };
  } catch (err) {
    console.error('Failed to save multiple gallery images:', err);
    return { added: 0, total: 0 };
  }
}

/**
 * Updates an existing gallery image's metadata (e.g. title, caption, category).
 */
export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: GalleryImage | undefined = getReq.result;
        if (!item) {
          resolve(false);
          return;
        }

        const updatedItem = { ...item, ...updates };
        const putReq = store.put(updatedItem);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error('Failed to update gallery image:', err);
    return false;
  }
}

/**
 * Deletes a single image by ID.
 */
export async function deleteGalleryImage(id: string): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to delete gallery image:', err);
    return false;
  }
}

/**
 * Deletes multiple images by ID array.
 */
export async function deleteMultipleGalleryImages(ids: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to delete multiple gallery images:', err);
    return false;
  }
}

/**
 * Clears all gallery images.
 */
export async function clearAllGalleryImages(): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to clear gallery images:', err);
    return false;
  }
}

/**
 * Resizes and optimizes image files for optimal memory and storage.
 * Keeps aspect ratio, caps at 1920px max dimension, and compresses to WebP/JPEG dataUrl.
 */
export function processAndOptimizeImageFile(
  file: File
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }

      // If it's an SVG or GIF, preserve directly to avoid losing animations or vectors
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve({
          dataUrl: result,
          width: 800,
          height: 600,
          sizeBytes: file.size,
        });
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxDim = 1920;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: result,
            width,
            height,
            sizeBytes: file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let optimizedDataUrl: string;
        try {
          optimizedDataUrl = canvas.toDataURL('image/webp', 0.88);
          if (!optimizedDataUrl.startsWith('data:image/webp')) {
            optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          }
        } catch {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        }

        const sizeBytes = Math.round((optimizedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: optimizedDataUrl,
          width,
          height,
          sizeBytes,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = result;
    };

    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(file);
  });
}
