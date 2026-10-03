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

const STORAGE_KEY = 'ja_portfolio_cert_images_v2';
export const CERT_UPDATE_EVENT = 'ja_certification_images_updated';

// In-memory runtime cache
let memoryCache: Record<string, StoredCertification> | null = null;

function normalizeSavedData(raw: any): Record<string, StoredCertification> {
  const normalized: Record<string, StoredCertification> = {};
  if (!raw || typeof raw !== 'object') return normalized;

  Object.entries(raw).forEach(([certId, val]: [string, any]) => {
    if (!val) return;
    if (typeof val === 'string') {
      // Legacy string dataUrl
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
 * Returns stored certifications synchronously from bundled data and localStorage cache.
 * Guarantees zero latency on initial render across any device or browser.
 */
export function getStoredCertificationsSync(): Record<string, StoredCertification> {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Start with permanent bundled data as base
  const bundled = normalizeSavedData(defaultSavedCerts);
  let localData: Record<string, StoredCertification> = {};

  // 2. Overlay localStorage cache if available
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        localData = normalizeSavedData(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading certification localStorage cache:', e);
    }
  }

  memoryCache = { ...bundled, ...localData };
  return memoryCache;
}

/**
 * Asynchronously synchronizes stored certifications with the server endpoint.
 * Keeps permanent server files and client state in sync across devices.
 */
export async function fetchStoredCertifications(): Promise<Record<string, StoredCertification>> {
  const syncData = getStoredCertificationsSync();

  if (typeof window === 'undefined') {
    return syncData;
  }

  const endpoints = [
    '/api/certifications',
    `${import.meta.env.BASE_URL}api/certifications`,
    `${import.meta.env.BASE_URL}data/savedCertifications.json`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        const serverData = json.data || json;
        if (serverData && typeof serverData === 'object') {
          const normalizedServer = normalizeSavedData(serverData);
          memoryCache = { ...syncData, ...normalizedServer };

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
          } catch {
            // ignore storage quota error
          }

          window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
          return memoryCache;
        }
      }
    } catch {
      // try next fallback endpoint
    }
  }

  return syncData;
}

/**
 * Saves or updates a certification image permanently.
 * Writes to localStorage, posts to server API to write physical file, and notifies all components.
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

  // 1. Immediate optimistic memory & localStorage update
  current[certId] = newItem;
  memoryCache = { ...current };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
  }

  // 2. Persist to server API permanently
  const endpoints = ['/api/certifications', `${import.meta.env.BASE_URL}api/certifications`];
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
            imageUrl: result.item.imageUrl || newItem.imageUrl,
          };
          current[certId] = finalItem;
          memoryCache = { ...current };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
            } catch {
              // ignore
            }
            window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
          }
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
 * Removes a certification image permanently.
 */
export async function removeCertificationImage(certId: string): Promise<void> {
  const current = getStoredCertificationsSync();
  delete current[certId];
  memoryCache = { ...current };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(CERT_UPDATE_EVENT, { detail: memoryCache }));
  }

  // Call DELETE on server API
  const endpoints = ['/api/certifications', `${import.meta.env.BASE_URL}api/certifications`];
  for (const url of endpoints) {
    try {
      await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certId }),
      });
      break;
    } catch {
      // fallback
    }
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
      dataUrl: item.imageUrl || item.dataUrl || '',
      title: item.title,
      caption: `${item.badgeLevel ? item.badgeLevel + ' • ' : ''}Issued by ${item.issuer || 'Accredited Authority'}${item.date ? ' (' + item.date + ')' : ''}`,
      category: 'Certifications',
      uploadedAt: item.uploadedAt || Date.now(),
      width: 850,
      height: 860,
    }));
}
