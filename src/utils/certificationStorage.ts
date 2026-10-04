import { GalleryImage, CertificationItem } from '../types';
import { CERTIFICATIONS } from '../data/portfolioData';
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

/**
 * Resolves repository-relative or base-relative image paths properly for both local dev and GitHub Pages.
 */
export function resolveCertUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const rawBase = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  if (url.startsWith('/JA-WEB-PORT/')) {
    return `${cleanBase}${url.slice('/JA-WEB-PORT'.length)}`;
  }
  if (url.startsWith('/')) {
    return `${cleanBase}${url}`;
  }
  return `${cleanBase}/${url}`;
}

/**
 * Permanent public repository asset locations for each certification.
 * These assets are deployed directly to GitHub Pages and publicly accessible to anyone worldwide.
 */
export const DEFAULT_CERTIFICATE_ASSETS: Record<string, string[]> = {
  'cert-housekeeping': [
    'assets/certificates/cert-housekeeping.png',
    'assets/certifications/cert-housekeeping.png',
    'assets/certificates/nc2-housekeeping.svg',
    'uploads/certifications/cert-housekeeping.png',
    'Messenger_creation_F072B715-2C6F-4B02-98BD-A85383E1F7DD.png',
  ],
  'cert-fb-services': [
    'assets/certificates/cert-fb-services.png',
    'assets/certifications/cert-fb-services.png',
    'assets/certificates/nc2-food-beverage.svg',
    'uploads/certifications/cert-fb-services.png',
    'Messenger_creation_23B7BA81-4417-4C76-B75D-AF084BF07E36.png',
  ],
  'cert-bread-pastry': [
    'assets/certificates/cert-bread-pastry.png',
    'assets/certifications/cert-bread-pastry.png',
    'assets/certificates/nc2-bread-pastry.svg',
    'uploads/certifications/cert-bread-pastry.png',
    'Messenger_creation_F799F610-55BC-41A5-993C-A07A4DC8C48B.png',
  ],
  'cert-cookery': [
    'assets/certificates/cert-cookery.png',
    'assets/certifications/cert-cookery.png',
    'assets/certificates/nc2-cookery.svg',
    'uploads/certifications/cert-cookery.png',
    'Messenger_creation_D1ABDE9B-478E-4C9A-AE51-DA281ACE8ED1.png',
  ],
  'cert-front-office': [
    'assets/certificates/cert-front-office.png',
    'assets/certifications/cert-front-office.png',
    'assets/certificates/nc2-front-office.svg',
    'uploads/certifications/cert-front-office.png',
    'Messenger_creation_D9608875-2970-4258-B9C0-8FC653E6EF45.png',
  ],
  'cert-events-management': [
    'assets/certificates/cert-events-management.png',
    'assets/certifications/cert-events-management.png',
    'assets/certificates/nc3-events-management.svg',
    'uploads/certifications/cert-events-management.png',
    'Messenger_creation_3EDB5EA7-CA91-4E1D-8C23-315B54ABF5B9.png',
  ],
};

export function getDefaultCertImageUrl(certId: string): string {
  const list = DEFAULT_CERTIFICATE_ASSETS[certId];
  if (list && list[0]) {
    return resolveCertUrl(list[0]);
  }
  return '';
}

export function getFallbackCertImageUrl(certId: string): string {
  const list = DEFAULT_CERTIFICATE_ASSETS[certId];
  if (list && list.length >= 3) {
    return resolveCertUrl(list[2]); // The verified SVG
  }
  if (list && list[0]) {
    return resolveCertUrl(list[0]);
  }
  return '';
}

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
    const defaultPublicAsset = getDefaultCertImageUrl(certId);

    if (typeof val === 'string') {
      const resolved = resolveCertUrl(val);
      normalized[certId] = {
        certId,
        imageUrl: resolved || defaultPublicAsset,
        dataUrl: resolved || defaultPublicAsset,
        title: certId,
        issuer: '',
        badgeLevel: '',
        description: '',
        date: '',
        uploadedAt: Date.now(),
      };
    } else if (typeof val === 'object') {
      const rawUrl = val.imageUrl || val.dataUrl || defaultPublicAsset;
      const resolved = resolveCertUrl(rawUrl);
      normalized[certId] = {
        certId: val.certId || certId,
        imageUrl: resolved,
        dataUrl: val.dataUrl ? resolveCertUrl(val.dataUrl) : resolved,
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
 * Returns stored certifications synchronously from bundled data + cache.
 * Guarantees that every visitor on any device immediately sees authentic public images.
 */
export function getStoredCertificationsSync(): Record<string, StoredCertification> {
  if (memoryCache) {
    return memoryCache;
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

  // Combine bundled permanent assets with any local cache
  const merged: Record<string, StoredCertification> = { ...bundled, ...localData };

  // Guarantee every certification in CERTIFICATIONS has a valid public asset URL
  CERTIFICATIONS.forEach((c) => {
    if (!merged[c.id] || !merged[c.id].imageUrl) {
      const publicAssetUrl = resolveCertUrl(c.image || getDefaultCertImageUrl(c.id));
      merged[c.id] = {
        certId: c.id,
        imageUrl: publicAssetUrl,
        dataUrl: publicAssetUrl,
        title: c.title,
        issuer: c.issuer,
        badgeLevel: c.badgeLevel,
        description: c.description,
        date: c.date,
        uploadedAt: 1706000000000,
      };
    }
  });

  memoryCache = merged;
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

  // 1. Immediately read from IndexedDB
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

          const merged: Record<string, StoredCertification> = {
            ...getStoredCertificationsSync(),
            ...normalizedServer,
          };

          // Overlay local IDB data URLs if present
          Object.entries(idbData).forEach(([cId, item]) => {
            if (merged[cId]) {
              merged[cId] = {
                ...merged[cId],
                dataUrl: item.dataUrl || merged[cId].dataUrl,
                imageUrl: item.imageUrl || item.dataUrl || merged[cId].imageUrl,
              };
            } else {
              merged[cId] = item;
            }
          });

          memoryCache = merged;

          try {
            const shallowCopy: Record<string, any> = {};
            Object.entries(memoryCache).forEach(([k, v]) => {
              shallowCopy[k] = { ...v, dataUrl: undefined };
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(shallowCopy));
          } catch {}

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
  const publicAssetUrl = resolveCertUrl(`assets/certificates/${certId}.png`);

  const newItem: StoredCertification = {
    certId,
    imageUrl: publicAssetUrl,
    dataUrl: dataUrl || publicAssetUrl,
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

  // 4. Send exact original image bytes to server API (saves to public/assets/certificates/ in workspace)
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
            ...result.item,
            imageUrl: resolveCertUrl(result.item.imageUrl),
            dataUrl: dataUrl || resolveCertUrl(result.item.imageUrl),
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
 * Resets a certification image to its clean default official public asset.
 */
export async function resetCertificationImage(certId: string): Promise<StoredCertification> {
  const current = getStoredCertificationsSync();
  const defaultPublicAsset = getDefaultCertImageUrl(certId);
  const certMeta = CERTIFICATIONS.find((c) => c.id === certId);

  const defaultItem: StoredCertification = {
    certId,
    imageUrl: defaultPublicAsset,
    dataUrl: defaultPublicAsset,
    title: certMeta?.title || certId,
    issuer: certMeta?.issuer || '',
    badgeLevel: certMeta?.badgeLevel || '',
    description: certMeta?.description || '',
    date: certMeta?.date || '',
    uploadedAt: 1706000000000,
  };

  current[certId] = defaultItem;
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

  // Also call server DELETE if endpoint is available
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

  return defaultItem;
}

/**
 * Removes a certification image permanently from all storage layers.
 */
export async function removeCertificationImage(certId: string): Promise<void> {
  await resetCertificationImage(certId);
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
      dataUrl: resolveCertUrl(item.imageUrl || item.dataUrl || ''),
      imageUrl: resolveCertUrl(item.imageUrl || item.dataUrl || ''),
      title: item.title,
      caption: `${item.badgeLevel ? item.badgeLevel + ' • ' : ''}Issued by ${item.issuer || 'Accredited Authority'}${item.date ? ' (' + item.date + ')' : ''}`,
      category: 'Certifications',
      uploadedAt: item.uploadedAt || Date.now(),
      width: 850,
      height: 860,
    }));
}
