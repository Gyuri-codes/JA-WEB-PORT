/**
 * IndexedDB & Persistent Storage for Jeric Abestano's Portfolio Portrait
 * Uses IndexedDB to safely store high-resolution 32-bit transparent PNGs
 * without triggering browser localStorage 5MB quota restrictions.
 */

const DB_NAME = 'JA_PORTFOLIO_DB_V3';
const DB_VERSION = 1;
const STORE_NAME = 'portrait_store';
const PORTRAIT_KEY = 'active_profile_portrait_v3';
const LOCAL_STORAGE_KEY = 'ja_portrait_cutout_v3';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Persists the transparent portrait PNG in IndexedDB, localStorage (fallback),
 * and syncs to backend server if running.
 */
export async function savePortraitToStorage(dataUrl: string): Promise<boolean> {
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    console.warn('Invalid PNG data URL provided for persistence');
    return false;
  }

  let idbSuccess = false;

  // 1. Save in IndexedDB (primary storage, high quota)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, PORTRAIT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    idbSuccess = true;
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage:', err);
  }

  // 2. Try localStorage as secondary backup
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, dataUrl);
  } catch (err) {
    // Expected if string exceeds 5MB; IndexedDB handles this case
    console.info('LocalStorage quota exceeded (expected for full-res PNGs), IndexedDB utilized.');
  }

  // 3. Try backend save if server endpoint exists
  try {
    await fetch('/api/save-portrait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
  } catch {
    // Non-blocking in client-only/static environments
  }

  return idbSuccess;
}

/**
 * Loads the saved transparent portrait PNG from IndexedDB or localStorage.
 */
export async function loadPortraitFromStorage(): Promise<string | null> {
  // 1. Try IndexedDB first
  try {
    const db = await openDatabase();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(PORTRAIT_KEY);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => reject(req.error);
    });

    if (result && result.startsWith('data:image/png')) {
      return result;
    }
  } catch (err) {
    console.warn('IndexedDB read failed, checking localStorage fallback:', err);
  }

  // 2. Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached && cached.startsWith('data:image/png')) {
      return cached;
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

/**
 * Removes the saved portrait from IndexedDB and localStorage.
 */
export async function clearPortraitFromStorage(): Promise<boolean> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(PORTRAIT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear from IndexedDB:', err);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore
  }

  return true;
}
