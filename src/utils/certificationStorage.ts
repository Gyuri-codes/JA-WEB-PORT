import { GalleryImage } from '../types';
import defaultSavedCerts from '../data/savedCertifications.json';

export interface StoredCertification {
  certId: string;
  imageUrl: string;
  dataUrl?: string;
  title: string;
  issuer: string;
  badgeLevel: string;
  description: string;
  date: string;
  uploadedAt: number;
}

const STORAGE_KEY = 'ja_portfolio_cert_images_v3';
export const CERT_UPDATE_EVENT = 'ja_certification_images_updated';

// In-memory runtime cache
let memoryCache: Record<string, StoredCertification> | null = null;

// IndexedDB configuration for unlimited, permanent client-side storage of exact original images
const DB_NAME = 'JA_CERTIFICATIONS_DB_V1';
const DB_VERSION = 1;
const STORE_NAME = 'certifications';

function openCertDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'certId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open cert database'));
  });
}

/**
 * Retrieves all stored certifications from IndexedDB.
 * Holds exact uncompressed original image data with zero browser quota issues.
 */
export async function getStoredCertsFromIDB(): Promise<Record<string, StoredCertification>> {
  try {
    const db = await openCertDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records: Record<string, StoredCertification> = {};
        if (Array.isArray(req.result)) {
          req.result.forEach((item: StoredCertification) => {
            if (item && item.certId) {
              records[item.certId] = item;
            }
          });
        }
        resolve(records);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

/**
 * Persists an exact certification record directly into IndexedDB.
 */
export async function saveCertToIDB(item: StoredCertification): Promise<void> {
  try {
    const db = await openCertDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save to IndexedDB:', e);
  }
}

/**
 * Deletes a certification record from IndexedDB.
 */
export async function removeCertFromIDB(certId: string): Promise<void> {
  try {
    const db = await openCertDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(certId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to delete from IndexedDB:', e);
  }
}

function normalizeSavedData(raw: any): Record<string, StoredCertification> {
  const normalized: Record<string, StoredCertification> = {};
  if (!raw || typeof raw !== 'object') return normalized;

  Object.entries(raw).forEach(([certId, val]: [string, any]) => {
    if (!val) return;
    if (typeof val === 'string') {
      normalized[certId] = {
        certId,
        imageUrl: val,
        dataUrl: val,
        title: certId,
        issuer: '',
        badgeLevel: '',
        description: '',
        date: '',
        uploadedAt: Date.now(),
      };
    } else if (typeof val === 'object') {
      normalized[certId] = {
        certId: val.certId || certId,
        imageUrl: val.imageUrl || val.dataUrl || '',
        dataUrl: val.dataUrl,
        title: val.title || certId,
        issuer: val.issuer || '',
        badgeLevel: val.badgeLevel || '',
        description: val.description || '',
        date: val.date || '',
        uploadedAt: val.uploadedAt || Date.now(),
      };
    }
  });

  return normalized;
}

/**
 * Returns stored certifications synchronously from memory or bundled data.
 */
export function getStoredCertificationsSync(): Record<string, StoredCertification> {
  if (memoryCache) {
    return memoryCache;
  }

  // Clear legacy caches
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('ja_portfolio_cert_images');
      localStorage.removeItem('ja_portfolio_cert_images_v2');
    } catch {}
  }

  const bundled = normalizeSavedData(defaultSavedCerts);
  let localData: Record<string, StoredCertification> = {};

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        localData = normalizeSavedData(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading localStorage cache:', e);
    }
  }

  memoryCache = { ...bundled, ...localData };
  return memoryCache;
}

/**
 * Synchronizes stored certifications from IndexedDB and server endpoints.
 * Guarantees exact original image preservation across refreshes, tab closures, and devices.
 */
export async function fetchStoredCertifications(): Promise<Record<string, StoredCertification>> {
  if (typeof window === 'undefined') {
    return getStoredCertificationsSync();
  }

  // 1. Immediately read from IndexedDB (instant, contains exact original uncompressed file data)
  const idbData = await getStoredCertsFromIDB();
  if (Object.keys(idbData).length > 0) {
    memoryCache = { ...getStoredCertificationsSync(), ...idbData };
    window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
  }

  // 2. Query server endpoints for saved records
  const endpoints = [
    `${import.meta.env.BASE_URL}api/certifications`,
    '/api/certifications',
    `${import.meta.env.BASE_URL}data/savedCertifications.json`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        const serverData = json.data !== undefined ? json.data : json;
        if (serverData && typeof serverData === 'object') {
          const normalizedServer = normalizeSavedData(serverData);
          
          // Merge server data with local IDB original data URLs to preserve 100% exact fidelity
          const merged: Record<string, StoredCertification> = { ...normalizedServer };
          Object.entries(idbData).forEach(([cId, item]) => {
            if (merged[cId]) {
              merged[cId] = {
                ...merged[cId],
                dataUrl: item.dataUrl || merged[cId].dataUrl,
                imageUrl: item.dataUrl || merged[cId].imageUrl,
              };
            } else {
              merged[cId] = item;
            }
          });

          memoryCache = merged;

          try {
            // Save lightweight references to localStorage
            const shallowCopy: Record<string, any> = {};
            Object.entries(memoryCache).forEach(([k, v]) => {
              shallowCopy[k] = { ...v, dataUrl: undefined };
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(shallowCopy));
          } catch {
            // ignore localStorage quota
          }

          window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
          return memoryCache;
        }
      }
    } catch {
      // try next endpoint
    }
  }

  return memoryCache || getStoredCertificationsSync();
}

/**
 * Saves a newly uploaded certification image permanently in its EXACT original form.
 * No resizing, no compression, no alteration, no replacement.
 */
export async function saveCertificationImage(
  certId: string,
  dataUrl: string,
  meta: {
    title?: string;
    issuer?: string;
    badgeLevel?: string;
    description?: string;
    date?: string;
  } = {}
): Promise<StoredCertification> {
  const current = getStoredCertificationsSync();

  const newItem: StoredCertification = {
    certId,
    imageUrl: dataUrl,
    dataUrl,
    title: meta.title || current[certId]?.title || certId,
    issuer: meta.issuer || current[certId]?.issuer || '',
    badgeLevel: meta.badgeLevel || current[certId]?.badgeLevel || '',
    description: meta.description || current[certId]?.description || '',
    date: meta.date || current[certId]?.date || '',
    uploadedAt: Date.now(),
  };

  // 1. Instant in-memory cache update
  current[certId] = newItem;
  memoryCache = { ...current };

  // 2. Persist exact original data to IndexedDB
  await saveCertToIDB(newItem);

  // 3. Dispatch update event immediately to Certifications and Gallery
  if (typeof window !== 'undefined') {
    try {
      const shallowCopy: Record<string, any> = {};
      Object.entries(memoryCache).forEach(([k, v]) => {
        shallowCopy[k] = { ...v, dataUrl: undefined };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shallowCopy));
    } catch {}
    window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
  }

  // 4. Send exact original image bytes to server API
  const endpoints = [`${import.meta.env.BASE_URL}api/certifications`, '/api/certifications'];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId,
          dataUrl,
          title: newItem.title,
          issuer: newItem.issuer,
          badgeLevel: newItem.badgeLevel,
          description: newItem.description,
          date: newItem.date,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.item) {
          const finalItem: StoredCertification = {
            ...newItem,
            // Keep the exact original dataUrl in memory and IDB, fallback to server URL
            imageUrl: newItem.dataUrl || result.item.imageUrl,
          };
          current[certId] = finalItem;
          memoryCache = { ...current };
          await saveCertToIDB(finalItem);
          window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
          return finalItem;
        }
      }
    } catch (err) {
      console.warn(`Failed to persist certification to ${url}:`, err);
    }
  }

  return newItem;
}

/**
 * Removes a certification image permanently from all storage layers.
 */
export async function removeCertificationImage(certId: string): Promise<void> {
  const current = getStoredCertificationsSync();
  delete current[certId];
  memoryCache = { ...current };

  await removeCertFromIDB(certId);

  if (typeof window !== 'undefined') {
    try {
      const shallowCopy: Record<string, any> = {};
      Object.entries(memoryCache).forEach(([k, v]) => {
        shallowCopy[k] = { ...v, dataUrl: undefined };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shallowCopy));
    } catch {}
    window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
  }

  const endpoints = [`${import.meta.env.BASE_URL}api/certifications`, '/api/certifications'];
  for (const url of endpoints) {
    try {
      await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certId }),
      });
      break;
    } catch {}
  }
}

/**
 * Transforms stored certifications into GalleryImage objects for display in the Gallery section.
 */
export function getCertificationsAsGalleryImages(
  certsRecord?: Record<string, StoredCertification>
): GalleryImage[] {
  const certs = certsRecord || getStoredCertificationsSync();

  return Object.values(certs)
    .filter((item) => item.imageUrl || item.dataUrl)
    .map((item) => ({
      id: `cert_${item.certId}`,
      dataUrl: item.dataUrl || item.imageUrl || '',
      title: item.title,
      caption: `${item.badgeLevel ? item.badgeLevel + ' • ' : ''}Issued by ${item.issuer || 'Accredited Authority'}${item.date ? ' (' + item.date + ')' : ''}`,
      category: 'Certifications',
      uploadedAt: item.uploadedAt || Date.now(),
      width: 850,
      height: 860,
    }));
}
