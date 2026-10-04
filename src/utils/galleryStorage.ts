import { GalleryImage, GalleryAlbum } from '../types';
import defaultGalleryData from '../data/galleryImages.json';

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

/**
 * Resolves repository-relative or base-relative image paths properly for both local dev and GitHub Pages.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

  if (url.startsWith('/JA-WEB-PORT/')) {
    return `${cleanBase}${url.slice('/JA-WEB-PORT'.length)}`;
  }
  if (url.startsWith('/')) {
    return `${cleanBase}${url}`;
  }
  return `${cleanBase}/${url}`;
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
  // Ensure image URL is resolved to repository path
  const resolved = resolveImageUrl(item.dataUrl);
  return {
    ...item,
    dataUrl: resolved,
  };
}

/**
 * Loads all stored gallery images.
 * Priority order:
 * 1. Permanent repository-hosted images bundled in `galleryImages.json` and served by GitHub Pages
 * 2. Freshly fetched data from live `/api/gallery` or `/JA-WEB-PORT/data/galleryImages.json`
 * 3. Local IndexedDB cache for immediate responsiveness
 */
export async function loadGalleryImages(): Promise<GalleryImage[]> {
  // 1. Start with permanent bundled repository images
  const bundledRaw: any[] = Array.isArray((defaultGalleryData as any)?.images)
    ? (defaultGalleryData as any).images
    : [];
  
  const bundledImages: GalleryImage[] = bundledRaw.map(sanitizeGalleryItem);

  // 2. Read local IndexedDB
  let localItems: GalleryImage[] = [];
  try {
    const db = await openGalleryDB();
    localItems = await new Promise<GalleryImage[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const rawItems: GalleryImage[] = request.result || [];
        resolve(rawItems.map(sanitizeGalleryItem));
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not read IndexedDB gallery items:', err);
  }

  // 3. Try to fetch latest repository data from API or JSON file
  let remoteImages: GalleryImage[] = [];
  if (typeof window !== 'undefined') {
    const endpoints = [
      `${import.meta.env.BASE_URL}api/gallery`,
      '/api/gallery',
      `${import.meta.env.BASE_URL}data/galleryImages.json`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.images || json.images;
          if (Array.isArray(list)) {
            remoteImages = list.map(sanitizeGalleryItem);
            break;
          }
        }
      } catch {
        // try next endpoint
      }
    }
  }

  // Merge sources: remote/bundled images are repository-permanent, localItems overlay new additions
  const mergedMap = new Map<string, GalleryImage>();

  // Add bundled first
  bundledImages.forEach((img) => mergedMap.set(img.id, img));
  // Overlay remote
  remoteImages.forEach((img) => mergedMap.set(img.id, img));
  // Overlay local items
  localItems.forEach((img) => {
    // If not already in map or if local has dataUrl, preserve
    if (!mergedMap.has(img.id)) {
      mergedMap.set(img.id, img);
    }
  });

  const finalImages = Array.from(mergedMap.values());
  finalImages.sort((a, b) => b.uploadedAt - a.uploadedAt);

  // Sync back to IndexedDB so local cache is fresh
  try {
    const db = await openGalleryDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    finalImages.forEach((img) => store.put(img));
  } catch {}

  return finalImages;
}

/**
 * Saves a single gallery image permanently.
 */
export async function saveGalleryImage(image: GalleryImage): Promise<{ success: boolean; reason?: string }> {
  const res = await saveMultipleGalleryImages([image]);
  return { success: res.added > 0 };
}

/**
 * Saves multiple gallery images permanently.
 * Persists to IndexedDB and posts to server API to save physical files in repository (public/uploads/gallery/).
 */
export async function saveMultipleGalleryImages(
  newImages: GalleryImage[]
): Promise<{ added: number; total: number }> {
  try {
    const db = await openGalleryDB();

    // 1. Immediately store in IndexedDB
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      newImages.forEach((img) => store.put(img));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // 2. Post to server endpoint to write physical repository files
    let savedServerImages: GalleryImage[] = [];
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: newImages }),
          });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.savedImages)) {
              savedServerImages = json.savedImages.map(sanitizeGalleryItem);
              break;
            }
          }
        } catch {
          // ignore or fallback to local
        }
      }
    }

    // 3. Update IndexedDB with repository image URLs if returned
    if (savedServerImages.length > 0) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      savedServerImages.forEach((img) => store.put(img));
    }

    const currentImages = await loadGalleryImages();
    return {
      added: newImages.length,
      total: currentImages.length,
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
    await new Promise<boolean>((resolve, reject) => {
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

    // Sync with server if available
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, updates }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to update gallery image:', err);
    return false;
  }
}

/**
 * Deletes a single image by ID and removes it from any albums it was part of.
 */
export async function deleteGalleryImage(id: string): Promise<boolean> {
  return deleteMultipleGalleryImages([id]);
}

/**
 * Deletes multiple images by ID array and removes them from albums and server files.
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

    // Delete on server
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to delete multiple gallery images:', err);
    return false;
  }
}

/**
 * Clears all gallery images and resets album image lists.
 */
export async function clearAllGalleryImages(): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    const allImages = await loadGalleryImages();
    const ids = allImages.map((i) => i.id);

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

    if (ids.length > 0 && typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          });
          break;
        } catch {}
      }
    }

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
 * Loads all albums from bundled repository data, server API, and IndexedDB.
 */
export async function loadGalleryAlbums(): Promise<GalleryAlbum[]> {
  const bundledAlbums: GalleryAlbum[] = Array.isArray((defaultGalleryData as any)?.albums)
    ? (defaultGalleryData as any).albums
    : [];

  let localAlbums: GalleryAlbum[] = [];
  try {
    const db = await openGalleryDB();
    localAlbums = await new Promise<GalleryAlbum[]>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readonly');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not read IndexedDB albums:', err);
  }

  // Merge bundled & local
  const albumMap = new Map<string, GalleryAlbum>();
  bundledAlbums.forEach((a) => albumMap.set(a.id, a));
  localAlbums.forEach((a) => albumMap.set(a.id, a));

  const list = Array.from(albumMap.values());
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

/**
 * Creates or updates an album.
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

    const currentAlbums = await loadGalleryAlbums();
    syncAlbumsToServer(currentAlbums);

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
    await new Promise<boolean>((resolve, reject) => {
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

    const currentAlbums = await loadGalleryAlbums();
    syncAlbumsToServer(currentAlbums);

    return true;
  } catch (err) {
    console.error('Failed to update album:', err);
    return false;
  }
}

/**
 * Deletes an album.
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

    const currentAlbums = await loadGalleryAlbums();
    syncAlbumsToServer(currentAlbums);

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
    await new Promise<boolean>((resolve, reject) => {
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

        if (!album.coverImageId && album.imageIds.length > 0) {
          album.coverImageId = album.imageIds[0];
        }

        const putReq = store.put(album);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });

    const currentAlbums = await loadGalleryAlbums();
    syncAlbumsToServer(currentAlbums);

    return true;
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
    await new Promise<boolean>((resolve, reject) => {
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

    const currentAlbums = await loadGalleryAlbums();
    syncAlbumsToServer(currentAlbums);

    return true;
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

async function syncAlbumsToServer(albums: GalleryAlbum[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const endpoints = [`${import.meta.env.BASE_URL}api/gallery/albums`, '/api/gallery/albums'];
  for (const url of endpoints) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_albums', albums }),
      });
      break;
    } catch {}
  }
}

/**
 * Reads an image file into dataUrl while preserving 100% of the original uncompressed file.
 * Never downscales, compresses, filters, or alters the original bytes.
 */
export function processAndOptimizeImageFile(
  file: File
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number; originalFileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }

      // Read natural dimensions purely for display metadata without modifying the image
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl: result,
          width: img.naturalWidth || img.width || 1200,
          height: img.naturalHeight || img.height || 800,
          sizeBytes: file.size,
          originalFileName: file.name,
        });
      };

      img.onerror = () => {
        resolve({
          dataUrl: result,
          width: 1200,
          height: 800,
          sizeBytes: file.size,
          originalFileName: file.name,
        });
      };

      img.src = result;
    };

    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(file);
  });
}
