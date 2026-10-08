import { GalleryImage, GalleryAlbum } from '../types';
import defaultGalleryData from '../data/galleryImages.json';

const DB_NAME = 'JA_GALLERY_DB_V2';
const DB_VERSION = 2;
const STORE_NAME = 'gallery_items_v2';
const ALBUM_STORE_NAME = 'gallery_albums_v2';

const DELETED_IDS_KEY = 'ja_gallery_deleted_ids_v3';
const PUBLIC_META_KEY = 'ja_gallery_public_meta_v2';

// In-memory set of deleted IDs to avoid resurrection
const inMemoryDeletedIds = new Set<string>();

/**
 * Returns all deleted image IDs recorded locally and from bundled data.
 */
export function getDeletedImageIds(): Set<string> {
  const ids = new Set<string>(inMemoryDeletedIds);

  const bundledDeleted: string[] = Array.isArray((defaultGalleryData as any)?.deletedIds)
    ? (defaultGalleryData as any).deletedIds
    : [];
  bundledDeleted.forEach((id) => ids.add(id));

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(DELETED_IDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => ids.add(id));
        }
      }
    } catch {}
  }
  return ids;
}

/**
 * Permanently records deleted image IDs in memory and localStorage.
 */
export function recordDeletedImageIds(newIds: string[]): void {
  newIds.forEach((id) => inMemoryDeletedIds.add(id));
  if (typeof window !== 'undefined') {
    try {
      const all = getDeletedImageIds();
      newIds.forEach((id) => all.add(id));
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(all)));
    } catch {}
  }
}

/**
 * Unmarks image IDs from deleted set if they are re-uploaded.
 */
export function unmarkImageAsDeleted(ids: string[]): void {
  ids.forEach((id) => inMemoryDeletedIds.delete(id));
  if (typeof window !== 'undefined') {
    try {
      const all = getDeletedImageIds();
      ids.forEach((id) => all.delete(id));
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(all)));
    } catch {}
  }
}

/**
 * Resolves repository-relative or base-relative image paths properly for both local dev and GitHub Pages.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const rawBase = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  let pathWithoutBase = url;
  if (url.startsWith('/JA-WEB-PORT/')) {
    pathWithoutBase = url.slice('/JA-WEB-PORT'.length);
  } else if (url.startsWith('JA-WEB-PORT/')) {
    pathWithoutBase = '/' + url.slice('JA-WEB-PORT/'.length);
  }

  if (!pathWithoutBase.startsWith('/')) {
    pathWithoutBase = '/' + pathWithoutBase;
  }

  // Safe encoding for GitHub Pages URLs with spaces or special characters
  const encodedPath = encodeURI(pathWithoutBase);
  return `${cleanBase}${encodedPath}`;
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

export function isCertificationItem(item: any): boolean {
  if (!item) return false;
  const id = String(item.id || item.certId || '');
  if (id.startsWith('cert_') || id.startsWith('cert-')) return true;
  const url = String(item.imageUrl || item.dataUrl || '');
  if (url.includes('/certificates/') || url.includes('/certifications/')) return true;
  return false;
}

function sanitizeGalleryItem(item: GalleryImage): GalleryImage {
  if (item.category && REMOVED_GALLERY_CATEGORIES.has(item.category)) {
    return { ...item, category: undefined };
  }
  const raw = item.dataUrl || item.imageUrl || '';
  const resolved = resolveImageUrl(raw);
  return {
    ...item,
    dataUrl: resolved,
    imageUrl: resolved,
  };
}

/**
 * Synchronous getter for immediate initial render from bundled data + cache.
 */
export function getStoredGalleryImagesSync(): GalleryImage[] {
  const deletedSet = getDeletedImageIds();
  const bundledRaw: any[] = Array.isArray((defaultGalleryData as any)?.images)
    ? (defaultGalleryData as any).images
    : [];
  let localFallback: GalleryImage[] = [];
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(PUBLIC_META_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          localFallback = parsed.map(sanitizeGalleryItem);
        }
      }
    } catch {}
  }
  const mergedMap = new Map<string, GalleryImage>();
  bundledRaw.filter((img) => !isCertificationItem(img)).map(sanitizeGalleryItem).forEach((img) => {
    if (!deletedSet.has(img.id)) mergedMap.set(img.id, img);
  });
  localFallback.filter((img) => !isCertificationItem(img)).forEach((img) => {
    if (!deletedSet.has(img.id)) mergedMap.set(img.id, img);
  });
  const list = Array.from(mergedMap.values()).filter((img) => !deletedSet.has(img.id) && !isCertificationItem(img));
  list.sort((a, b) => b.uploadedAt - a.uploadedAt);
  return list;
}

/**
 * Synchronous getter for albums from bundled data.
 */
export function getStoredGalleryAlbumsSync(): GalleryAlbum[] {
  const bundledRaw: any[] = Array.isArray((defaultGalleryData as any)?.albums)
    ? (defaultGalleryData as any).albums
    : [];
  return bundledRaw;
}

/**
 * Loads all stored gallery images.
 * Priority order:
 * 1. Permanent repository-hosted images bundled in `galleryImages.json` and served by GitHub Pages
 * 2. Freshly fetched data from live `/api/gallery` or `/JA-WEB-PORT/data/galleryImages.json`
 * 3. Local IndexedDB cache for immediate responsiveness
 * Strips any permanently deleted image IDs.
 */
export async function loadGalleryImages(): Promise<GalleryImage[]> {
  const deletedSet = getDeletedImageIds();

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

  // 3. Try localStorage fallback
  let localFallback: GalleryImage[] = [];
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(PUBLIC_META_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          localFallback = parsed.map(sanitizeGalleryItem);
        }
      }
    } catch {}
  }

  // 4. Try to fetch latest repository data from API or JSON file
  let remoteImages: GalleryImage[] = [];
  if (typeof window !== 'undefined') {
    const endpoints = [
      `${import.meta.env.BASE_URL}api/gallery`,
      '/api/gallery',
      `${import.meta.env.BASE_URL}data/galleryImages.json`,
      '/data/galleryImages.json',
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.images || json.images;
          const remoteDeleted = json.data?.deletedIds || json.deletedIds;
          if (Array.isArray(remoteDeleted)) {
            recordDeletedImageIds(remoteDeleted);
          }
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

  // Refresh deleted set after potential remote fetch
  const currentDeleted = getDeletedImageIds();

  // Merge sources
  const mergedMap = new Map<string, GalleryImage>();

  bundledImages.forEach((img) => {
    if (!currentDeleted.has(img.id)) {
      mergedMap.set(img.id, img);
    }
  });

  remoteImages.forEach((img) => {
    if (!currentDeleted.has(img.id)) {
      mergedMap.set(img.id, img);
    }
  });

  localFallback.forEach((img) => {
    if (!currentDeleted.has(img.id) && !mergedMap.has(img.id)) {
      mergedMap.set(img.id, img);
    }
  });

  localItems.forEach((img) => {
    if (!currentDeleted.has(img.id)) {
      if (!mergedMap.has(img.id)) {
        mergedMap.set(img.id, img);
      }
    }
  });

  const finalImages = Array.from(mergedMap.values()).filter((img) => !currentDeleted.has(img.id) && !isCertificationItem(img));
  finalImages.sort((a, b) => b.uploadedAt - a.uploadedAt);

  // Sync back to IndexedDB so local cache is clean and deleted IDs are purged
  try {
    const db = await openGalleryDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    currentDeleted.forEach((dId) => store.delete(dId));
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
 * Persists to IndexedDB and posts to server API in safe chunks to save physical files in repository (public/assets/gallery/).
 */
export async function saveMultipleGalleryImages(
  newImages: GalleryImage[],
  onProgress?: (saved: number, total: number) => void
): Promise<{ added: number; total: number; savedImages?: GalleryImage[] }> {
  try {
    const newIds = newImages.map((img) => img.id);
    unmarkImageAsDeleted(newIds);

    const db = await openGalleryDB();

    // 1. Immediately store in IndexedDB
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      newImages.forEach((img) => store.put(img));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // 2. Post to server endpoint one by one (chunk size 1) to avoid payload limits
    const CHUNK_SIZE = 1;
    const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
    const savedServerImages: GalleryImage[] = [];

    if (typeof window !== 'undefined') {
      for (let i = 0; i < newImages.length; i += CHUNK_SIZE) {
        const chunk = newImages.slice(i, i + CHUNK_SIZE);
        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ images: chunk }),
            });
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json.savedImages)) {
                savedServerImages.push(...json.savedImages.map(sanitizeGalleryItem));
                if (onProgress) {
                  onProgress(savedServerImages.length, newImages.length);
                }
                break;
              }
            }
          } catch {
            // try next endpoint or fallback to local
          }
        }
      }
    }

    // 3. Update IndexedDB with permanent repository image URLs
    if (savedServerImages.length > 0) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      savedServerImages.forEach((img) => {
        const itemToStore: GalleryImage = {
          ...img,
          dataUrl: resolveImageUrl(img.imageUrl || img.dataUrl),
          imageUrl: resolveImageUrl(img.imageUrl || img.dataUrl),
        };
        store.put(itemToStore);
      });
    }

    const currentImages = await loadGalleryImages();

    if (typeof window !== 'undefined') {
      try {
        const shallow = currentImages.map((img) => ({
          ...img,
          dataUrl: resolveImageUrl(img.dataUrl || img.imageUrl),
          imageUrl: resolveImageUrl(img.imageUrl || img.dataUrl),
        }));
        localStorage.setItem(PUBLIC_META_KEY, JSON.stringify(shallow));
      } catch {}
      window.dispatchEvent(new CustomEvent('ja_gallery_images_updated'));
    }

    return {
      added: savedServerImages.length > 0 ? savedServerImages.length : newImages.length,
      total: currentImages.length,
      savedImages: savedServerImages,
    };
  } catch (err) {
    console.error('Failed to save multiple gallery images:', err);
    return { added: 0, total: 0 };
  }
}

/**
 * Scans all client-side browser storage (IndexedDB databases and localStorage) for uploaded Gallery images
 * that currently only exist in browser storage as base64 data, and automatically transmits them to the server
 * so they are permanently saved as physical repository files in /assets/gallery/ and cataloged in galleryImages.json.
 */
export async function autoMigrateBrowserImagesToRepository(
  onProgress?: (migratedCount: number, total: number) => void
): Promise<{ migratedCount: number; message: string }> {
  if (typeof window === 'undefined') {
    return { migratedCount: 0, message: 'Server environment' };
  }

  try {
    const unmigratedImages: GalleryImage[] = [];
    const unmigratedAlbums: GalleryAlbum[] = [];
    const seenIds = new Set<string>();

    // 1. Fetch current repository images to know what's already saved permanently on the server
    const remoteList: any[] = await fetch(`${import.meta.env.BASE_URL}api/gallery`)
      .then((r) => r.json())
      .then((j) => j.data?.images || j.images || [])
      .catch(() => (defaultGalleryData as any)?.images || []);
    const serverSavedIds = new Set(
      remoteList
        .filter((img: any) => img && img.imageUrl && !img.imageUrl.startsWith('data:') && !img.imageUrl.startsWith('blob:'))
        .map((img: any) => img.id)
    );

    // 2. Check all possible IndexedDB databases
    const dbNames = ['JA_GALLERY_DB_V2', 'JA_GALLERY_DB_V1', 'JA_GALLERY_DB', 'gallery_db'];
    for (const dbName of dbNames) {
      try {
        await new Promise<void>((resolve) => {
          const req = window.indexedDB.open(dbName);
          req.onsuccess = () => {
            const db = req.result;
            const storeNames = Array.from(db.objectStoreNames);

            const itemStores = storeNames.filter((s) => s.includes('item') || s.includes('image') || s.includes('photo'));
            const albumStores = storeNames.filter((s) => s.includes('album'));

            let pending = itemStores.length + albumStores.length;
            if (pending === 0) {
              db.close();
              resolve();
              return;
            }

            itemStores.forEach((sName) => {
              try {
                const tx = db.transaction(sName, 'readonly');
                const store = tx.objectStore(sName);
                const getReq = store.getAll();
                getReq.onsuccess = () => {
                  const items: any[] = getReq.result || [];
                  items.forEach((item) => {
                    if (item && item.id && !seenIds.has(item.id) && !isCertificationItem(item)) {
                      const data = item.dataUrl || item.imageUrl;
                      if (data && typeof data === 'string' && data.startsWith('data:image/')) {
                        if (!serverSavedIds.has(item.id)) {
                          seenIds.add(item.id);
                          unmigratedImages.push(item);
                        }
                      }
                    }
                  });
                  pending--;
                  if (pending === 0) {
                    db.close();
                    resolve();
                  }
                };
                getReq.onerror = () => {
                  pending--;
                  if (pending === 0) {
                    db.close();
                    resolve();
                  }
                };
              } catch {
                pending--;
                if (pending === 0) {
                  db.close();
                  resolve();
                }
              }
            });

            albumStores.forEach((sName) => {
              try {
                const tx = db.transaction(sName, 'readonly');
                const store = tx.objectStore(sName);
                const getReq = store.getAll();
                getReq.onsuccess = () => {
                  const albums: any[] = getReq.result || [];
                  albums.forEach((album) => {
                    if (album && album.id) {
                      unmigratedAlbums.push(album);
                    }
                  });
                  pending--;
                  if (pending === 0) {
                    db.close();
                    resolve();
                  }
                };
                getReq.onerror = () => {
                  pending--;
                  if (pending === 0) {
                    db.close();
                    resolve();
                  }
                };
              } catch {
                pending--;
                if (pending === 0) {
                  db.close();
                  resolve();
                }
              }
            });
          };
          req.onerror = () => resolve();
        });
      } catch {}
    }

    // 3. Check localStorage
    const localKeys = ['ja_gallery_public_meta_v2', 'ja_gallery_images', 'gallery_items'];
    localKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item && item.id && !seenIds.has(item.id) && !isCertificationItem(item)) {
                const data = item.dataUrl || item.imageUrl;
                if (data && typeof data === 'string' && data.startsWith('data:image/')) {
                  if (!serverSavedIds.has(item.id)) {
                    seenIds.add(item.id);
                    unmigratedImages.push(item);
                  }
                }
              }
            });
          }
        }
      } catch {}
    });

    if (unmigratedImages.length === 0) {
      return { migratedCount: 0, message: 'All gallery images are already permanently saved in the repository.' };
    }

    // 4. Save unmigrated images to repository via chunked saveMultipleGalleryImages
    const result = await saveMultipleGalleryImages(unmigratedImages, onProgress);

    // 5. If there are albums in browser storage, save them to the server too
    if (unmigratedAlbums.length > 0) {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: unmigratedAlbums }),
          });
          break;
        } catch {}
      }
    }

    return {
      migratedCount: result.added,
      message: `Successfully migrated ${result.added} photos to permanent repository assets.`,
    };
  } catch (err) {
    console.error('Auto-migration error:', err);
    return { migratedCount: 0, message: 'Failed to migrate gallery images.' };
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
 * Deletes multiple images by ID array and permanently removes them from albums and server files.
 */
export async function deleteMultipleGalleryImages(ids: string[]): Promise<boolean> {
  try {
    recordDeletedImageIds(ids);

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

    // Delete in localStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(PUBLIC_META_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item: any) => !ids.includes(item.id));
            localStorage.setItem(PUBLIC_META_KEY, JSON.stringify(filtered));
          }
        }
      } catch {}
    }

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
      window.dispatchEvent(new CustomEvent('ja_gallery_images_updated'));
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
    const allImages = await loadGalleryImages();
    const ids = allImages.map((i) => i.id);
    recordDeletedImageIds(ids);

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

    if (typeof window !== 'undefined') {
      localStorage.removeItem(PUBLIC_META_KEY);
    }

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
      window.dispatchEvent(new CustomEvent('ja_gallery_images_updated'));
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
      store.put(album);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const currentAlbums = await loadGalleryAlbums();
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: currentAlbums }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to save gallery album:', err);
    return false;
  }
}

/**
 * Updates an album's name, description, or cover image.
 */
export async function updateGalleryAlbum(id: string, updates: Partial<GalleryAlbum>): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: GalleryAlbum | undefined = getReq.result;
        if (!item) {
          resolve(false);
          return;
        }
        const updated = { ...item, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });

    const currentAlbums = await loadGalleryAlbums();
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: currentAlbums }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to update gallery album:', err);
    return false;
  }
}

/**
 * Deletes an album (photos inside it remain in the gallery).
 */
export async function deleteGalleryAlbum(id: string): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ALBUM_STORE_NAME, 'readwrite');
      const store = tx.objectStore(ALBUM_STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const currentAlbums = await loadGalleryAlbums();
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: currentAlbums }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to delete gallery album:', err);
    return false;
  }
}

/**
 * Adds multiple image IDs to an album.
 */
export async function addImagesToAlbum(albumId: string, imageIds: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction([ALBUM_STORE_NAME, STORE_NAME], 'readwrite');
      const albumStore = tx.objectStore(ALBUM_STORE_NAME);
      const imgStore = tx.objectStore(STORE_NAME);
      const getReq = albumStore.get(albumId);

      getReq.onsuccess = () => {
        const album: GalleryAlbum | undefined = getReq.result;
        if (!album) {
          resolve(false);
          return;
        }

        const existingSet = new Set(album.imageIds);
        imageIds.forEach((id) => existingSet.add(id));
        album.imageIds = Array.from(existingSet);

        if (!album.coverImageId && album.imageIds.length > 0) {
          album.coverImageId = album.imageIds[0];
        }

        albumStore.put(album);

        // Also update albumIds on image records
        imageIds.forEach((id) => {
          const imgReq = imgStore.get(id);
          imgReq.onsuccess = () => {
            const img: GalleryImage | undefined = imgReq.result;
            if (img) {
              const aIds = new Set(img.albumIds || []);
              aIds.add(albumId);
              img.albumIds = Array.from(aIds);
              imgStore.put(img);
            }
          };
        });
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });

    // Sync updated albums to server
    const currentAlbums = await loadGalleryAlbums();
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: currentAlbums }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to add images to album:', err);
    return false;
  }
}

/**
 * Removes multiple image IDs from an album (photos remain in main gallery).
 */
export async function removeImagesFromAlbum(albumId: string, imageIds: string[]): Promise<boolean> {
  try {
    const db = await openGalleryDB();
    await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction([ALBUM_STORE_NAME, STORE_NAME], 'readwrite');
      const albumStore = tx.objectStore(ALBUM_STORE_NAME);
      const imgStore = tx.objectStore(STORE_NAME);
      const getReq = albumStore.get(albumId);

      getReq.onsuccess = () => {
        const album: GalleryAlbum | undefined = getReq.result;
        if (!album) {
          resolve(false);
          return;
        }

        const removeSet = new Set(imageIds);
        album.imageIds = album.imageIds.filter((id) => !removeSet.has(id));

        if (album.coverImageId && removeSet.has(album.coverImageId)) {
          album.coverImageId = album.imageIds[0] || undefined;
        }

        albumStore.put(album);

        // Also remove albumId from image records
        imageIds.forEach((id) => {
          const imgReq = imgStore.get(id);
          imgReq.onsuccess = () => {
            const img: GalleryImage | undefined = imgReq.result;
            if (img && Array.isArray(img.albumIds)) {
              img.albumIds = img.albumIds.filter((aid) => aid !== albumId);
              imgStore.put(img);
            }
          };
        });
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });

    // Sync updated albums to server
    const currentAlbums = await loadGalleryAlbums();
    if (typeof window !== 'undefined') {
      const endpoints = [`${import.meta.env.BASE_URL}api/gallery`, '/api/gallery'];
      for (const url of endpoints) {
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_albums', albums: currentAlbums }),
          });
          break;
        } catch {}
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to remove images from album:', err);
    return false;
  }
}

/**
 * Moves images from one album to another.
 */
export async function moveImagesBetweenAlbums(
  sourceAlbumId: string,
  targetAlbumId: string,
  imageIds: string[]
): Promise<boolean> {
  const removed = await removeImagesFromAlbum(sourceAlbumId, imageIds);
  const added = await addImagesToAlbum(targetAlbumId, imageIds);
  return removed && added;
}

/**
 * Helper to process and preserve exact original image bytes via FileReader.
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

    reader.onerror = () => reject(new Error('FileReader error reading selected image'));
    reader.readAsDataURL(file);
  });
}
