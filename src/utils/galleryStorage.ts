import { GalleryImage, GalleryAlbum } from '../types';

const DB_NAME = 'JA_GALLERY_DB_V2';
const DB_VERSION = 2;
const STORE_NAME = 'gallery_items_v2';
const ALBUM_STORE_NAME = 'gallery_albums_v2';

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
      if (!db.objectStoreNames.contains(ALBUM_STORE_NAME)) {
        db.createObjectStore(ALBUM_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open gallery database'));
  });
}

const REMOVED_GALLERY_CATEGORIES = new Set([
  'Creative & Digital',
  'Campus & Events',
  'Certificates & Awards',
  'Culinary Craft',
  'Hospitality & Service',
  'Hospitality'
]);

function sanitizeGalleryItem(item: GalleryImage): GalleryImage {
  if (item.category && REMOVED_GALLERY_CATEGORIES.has(item.category)) {
    return { ...item, category: undefined };
  }
  return item;
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
        const manualItems = rawItems
          .filter((item) => !item.id.startsWith('starter-'))
          .map(sanitizeGalleryItem);
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
          return parsed
            .filter((item: GalleryImage) => !item.id.startsWith('starter-'))
            .map(sanitizeGalleryItem);
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
 * Deletes a single image by ID and removes it from any albums it was part of.
 */
export async function deleteGalleryImage(id: string): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, ALBUM_STORE_NAME], 'readwrite');
      const imgStore = tx.objectStore(STORE_NAME);
      const albumStore = tx.objectStore(ALBUM_STORE_NAME);

      imgStore.delete(id);

      const albumsReq = albumStore.getAll();
      albumsReq.onsuccess = () => {
        const albums: GalleryAlbum[] = albumsReq.result || [];
        albums.forEach((album) => {
          if (album.imageIds.includes(id)) {
            album.imageIds = album.imageIds.filter((imgId) => imgId !== id);
            if (album.coverImageId === id) {
              album.coverImageId = album.imageIds[0] || undefined;
            }
            albumStore.put(album);
          }
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to delete gallery image:', err);
    return false;
  }
}

/**
 * Deletes multiple images by ID array and removes them from albums.
 */
export async function deleteMultipleGalleryImages(ids: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, ALBUM_STORE_NAME], 'readwrite');
      const imgStore = tx.objectStore(STORE_NAME);
      const albumStore = tx.objectStore(ALBUM_STORE_NAME);

      ids.forEach((id) => imgStore.delete(id));

      const albumsReq = albumStore.getAll();
      albumsReq.onsuccess = () => {
        const albums: GalleryAlbum[] = albumsReq.result || [];
        albums.forEach((album) => {
          const filtered = album.imageIds.filter((imgId) => !ids.includes(imgId));
          if (filtered.length !== album.imageIds.length) {
            album.imageIds = filtered;
            if (album.coverImageId && ids.includes(album.coverImageId)) {
              album.coverImageId = album.imageIds[0] || undefined;
            }
            albumStore.put(album);
          }
        });
      };

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
 * Clears all gallery images and resets album image lists (albums themselves remain or are cleared).
 */
export async function clearAllGalleryImages(): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, ALBUM_STORE_NAME], 'readwrite');
      const imgStore = tx.objectStore(STORE_NAME);
      const albumStore = tx.objectStore(ALBUM_STORE_NAME);

      imgStore.clear();

      const albumsReq = albumStore.getAll();
      albumsReq.onsuccess = () => {
        const albums: GalleryAlbum[] = albumsReq.result || [];
        albums.forEach((album) => {
          album.imageIds = [];
          album.coverImageId = undefined;
          albumStore.put(album);
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to clear gallery images:', err);
    return false;
  }
}

/* =========================================================================
 * ALBUM MANAGEMENT FUNCTIONS
 * ========================================================================= */

/**
 * Loads all albums from IndexedDB.
 */
export async function loadGalleryAlbums(): Promise<GalleryAlbum[]> {
  try {
    const db = await openGalleryDB();
    return new Promise<GalleryAlbum[]>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readonly');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const albums: GalleryAlbum[] = request.result || [];
        albums.sort((a, b) => b.createdAt - a.createdAt);
        resolve(albums);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not load gallery albums from IndexedDB, falling back to localStorage:', err);
    try {
      const fallback = localStorage.getItem('ja_gallery_albums_v2');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Creates or updates an album in IndexedDB.
 */
export async function saveGalleryAlbum(album: GalleryAlbum): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const req = store.put(album);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to save album:', err);
    return false;
  }
}

/**
 * Updates an album's name, description, cover image, or imageIds.
 */
export async function updateGalleryAlbum(id: string, updates: Partial<GalleryAlbum>): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const album: GalleryAlbum | undefined = getReq.result;
        if (!album) {
          resolve(false);
          return;
        }

        const updated = { ...album, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error('Failed to update album:', err);
    return false;
  }
}

/**
 * Deletes an album.
 * IMPORTANT: This does NOT delete the images inside it; they remain in the main Gallery.
 */
export async function deleteGalleryAlbum(id: string): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to delete album:', err);
    return false;
  }
}

/**
 * Adds one or more images to an album.
 */
export async function addImagesToAlbum(albumId: string, imageIds: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const getReq = store.get(albumId);

      getReq.onsuccess = () => {
        const album: GalleryAlbum | undefined = getReq.result;
        if (!album) {
          resolve(false);
          return;
        }

        const currentSet = new Set(album.imageIds);
        imageIds.forEach((id) => currentSet.add(id));
        album.imageIds = Array.from(currentSet);

        // If no cover image was set, use the first image
        if (!album.coverImageId && album.imageIds.length > 0) {
          album.coverImageId = album.imageIds[0];
        }

        const putReq = store.put(album);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error('Failed to add images to album:', err);
    return false;
  }
}

/**
 * Removes one or more images from an album without deleting them from the Gallery.
 */
export async function removeImagesFromAlbum(albumId: string, imageIds: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const getReq = store.get(albumId);

      getReq.onsuccess = () => {
        const album: GalleryAlbum | undefined = getReq.result;
        if (!album) {
          resolve(false);
          return;
        }

        album.imageIds = album.imageIds.filter((id) => !imageIds.includes(id));
        if (album.coverImageId && imageIds.includes(album.coverImageId)) {
          album.coverImageId = album.imageIds[0] || undefined;
        }

        const putReq = store.put(album);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error('Failed to remove images from album:', err);
    return false;
  }
}

/**
 * Moves images from one album to another album.
 */
export async function moveImagesBetweenAlbums(
  fromAlbumId: string,
  toAlbumId: string,
  imageIds: string[]
): Promise<boolean> {
  try {
    await removeImagesFromAlbum(fromAlbumId, imageIds);
    await addImagesToAlbum(toAlbumId, imageIds);
    return true;
  } catch (err) {
    console.error('Failed to move images between albums:', err);
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
